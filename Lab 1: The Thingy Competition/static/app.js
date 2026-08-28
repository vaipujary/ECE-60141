const state = {
  image: null,
  size: 3,
  difficulty: "Easy",
  order: [],
  selectedIndex: null,
  moves: 0,
  startedAt: null,
  timerId: null,
  stream: null,
  muted: false,
  audioContext: null,
};

const screens = [...document.querySelectorAll(".screen")];
const fileInput = document.querySelector("#file-input");
const cameraVideo = document.querySelector("#camera-video");
const cameraMessage = document.querySelector("#camera-message");
const captureButton = document.querySelector("#capture-button");
const board = document.querySelector("#puzzle-board");
const previewOverlay = document.querySelector("#preview-overlay");
const previewButton = document.querySelector("#preview-button");

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle("is-active", screen.id === `${name}-screen`));
  if (name !== "camera") stopCamera();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const element = document.querySelector("#toast");
  element.textContent = message;
  element.classList.add("is-visible");
  window.clearTimeout(element.hideTimer);
  element.hideTimer = window.setTimeout(() => element.classList.remove("is-visible"), 2800);
}

async function prepareImage(blob, filename = "photo.jpg") {
  toast("Preparing your photo…");

  try {
    if (blob.size > 12 * 1024 * 1024) {
      throw new Error("That image is too large. Choose one under 12 MB.");
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
      throw new Error("Use a JPEG, PNG, or WebP image.");
    }

    const data = await prepareWithAvailableProcessor(blob, filename);
    state.image = data.image;
    document.querySelector("#preview-image").src = state.image;
    document.querySelector("#overlay-image").src = state.image;
    document.querySelector("#complete-image").src = state.image;
    showScreen("setup");
  } catch (error) {
    toast(error.message);
  }
}

async function prepareWithAvailableProcessor(blob, filename) {
  if (["127.0.0.1", "localhost"].includes(window.location.hostname)) {
    try {
      const health = await fetch("health", { cache: "no-store" });
      if (health.ok) {
        const form = new FormData();
        form.append("image", blob, filename);
        const response = await fetch("api/prepare-image", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The image could not be prepared.");
        return data;
      }
    } catch (error) {
      if (error instanceof Error && error.message !== "Failed to fetch") throw error;
    }
  }

  return prepareImageInBrowser(blob);
}

function prepareImageInBrowser(blob) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - cropSize) / 2;
      const sourceY = (image.naturalHeight - cropSize) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      canvas.getContext("2d").drawImage(
        image,
        sourceX,
        sourceY,
        cropSize,
        cropSize,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      URL.revokeObjectURL(sourceUrl);
      resolve({ image: canvas.toDataURL("image/jpeg", 0.9), width: 1200, height: 1200 });
    };

    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("That file is not a supported image."));
    };

    image.src = sourceUrl;
  });
}

async function startCamera() {
  showScreen("camera");
  cameraMessage.textContent = "Starting camera…";
  cameraMessage.classList.remove("is-hidden");
  captureButton.disabled = true;

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraMessage.textContent = "This browser cannot access a camera. Try uploading a photo instead.";
    return;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    cameraVideo.srcObject = state.stream;
    await cameraVideo.play();
    cameraMessage.classList.add("is-hidden");
    captureButton.disabled = false;
  } catch (_error) {
    cameraMessage.textContent = "Camera access was not allowed. Use Back, then upload a photo instead.";
  }
}

function stopCamera() {
  if (!state.stream) return;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
  cameraVideo.srcObject = null;
}

function capturePhoto() {
  const canvas = document.querySelector("#camera-canvas");
  const size = Math.min(cameraVideo.videoWidth, cameraVideo.videoHeight);
  const sourceX = (cameraVideo.videoWidth - size) / 2;
  const sourceY = (cameraVideo.videoHeight - size) / 2;
  canvas.width = 1200;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(cameraVideo, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
  context.restore();
  cameraVideo.parentElement.classList.add("shutter");
  sound("capture");
  canvas.toBlob((blob) => {
    cameraVideo.parentElement.classList.remove("shutter");
    stopCamera();
    prepareImage(blob, "camera-photo.jpg");
  }, "image/jpeg", 0.92);
}

function shuffledOrder(count) {
  const values = Array.from({ length: count }, (_, index) => index);
  do {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
    }
  } while (values.every((value, index) => value === index));
  return values;
}

function beginPuzzle() {
  const count = state.size * state.size;
  state.order = shuffledOrder(count);
  state.selectedIndex = null;
  state.moves = 0;
  state.startedAt = Date.now();
  document.querySelector("#move-count").textContent = "0";
  document.querySelector("#timer").textContent = "00:00";
  document.querySelector("#game-difficulty").textContent = state.difficulty;
  renderBoard();
  showScreen("game");
  window.clearInterval(state.timerId);
  state.timerId = window.setInterval(updateTimer, 250);
}

function renderBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
  state.order.forEach((piece, position) => {
    const row = Math.floor(piece / state.size);
    const column = piece % state.size;
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "puzzle-tile";
    tile.dataset.position = position;
    tile.setAttribute("aria-label", `Tile ${position + 1}${state.selectedIndex === position ? ", selected" : ""}`);
    tile.style.backgroundImage = `url(${state.image})`;
    tile.style.backgroundSize = `${state.size * 100}% ${state.size * 100}%`;
    tile.style.backgroundPosition = `${column * 100 / (state.size - 1)}% ${row * 100 / (state.size - 1)}%`;
    if (state.selectedIndex === position) tile.classList.add("is-selected");
    tile.addEventListener("click", () => selectTile(position));
    board.append(tile);
  });
}

function selectTile(position) {
  if (state.selectedIndex === null) {
    state.selectedIndex = position;
    sound("select");
    renderBoard();
    return;
  }

  if (state.selectedIndex === position) {
    state.selectedIndex = null;
    renderBoard();
    return;
  }

  const first = state.selectedIndex;
  [state.order[first], state.order[position]] = [state.order[position], state.order[first]];
  state.selectedIndex = null;
  state.moves += 1;
  document.querySelector("#move-count").textContent = state.moves;
  sound("move");
  renderBoard();

  if (state.order.every((value, index) => value === index)) finishPuzzle();
}

function elapsedSeconds() {
  return state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateTimer() {
  document.querySelector("#timer").textContent = formatTime(elapsedSeconds());
}

function finishPuzzle() {
  const finalTime = formatTime(elapsedSeconds());
  window.clearInterval(state.timerId);
  state.timerId = null;
  document.querySelector("#final-time").textContent = finalTime;
  document.querySelector("#final-moves").textContent = state.moves;
  document.querySelector("#final-difficulty").textContent = state.difficulty;
  showScreen("complete");
  sound("complete");
  celebrate();
}

function celebrate() {
  const holder = document.querySelector("#confetti");
  holder.innerHTML = "";
  const colors = ["#f36f56", "#0f827d", "#f3bd49", "#84c8bf", "#f8a97d"];
  for (let index = 0; index < 54; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.7}s`;
    piece.style.animationDuration = `${2.1 + Math.random() * 1.4}s`;
    holder.append(piece);
  }
}

function sound(kind) {
  if (state.muted) return;
  try {
    state.audioContext ||= new AudioContext();
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    const frequencies = { select: 420, move: 540, capture: 220, complete: 690 };
    oscillator.frequency.value = frequencies[kind] || 440;
    oscillator.type = kind === "complete" ? "sine" : "triangle";
    gain.gain.setValueAtTime(0.0001, state.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, state.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + (kind === "complete" ? 0.5 : 0.12));
    oscillator.connect(gain).connect(state.audioContext.destination);
    oscillator.start();
    oscillator.stop(state.audioContext.currentTime + (kind === "complete" ? 0.52 : 0.14));
  } catch (_error) {
    // Sound is optional. The puzzle still works if audio is unavailable.
  }
}

document.querySelector("#upload-button").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (file) prepareImage(file, file.name);
  fileInput.value = "";
});
document.querySelector("#camera-button").addEventListener("click", startCamera);
captureButton.addEventListener("click", capturePhoto);
document.querySelector("#start-button").addEventListener("click", beginPuzzle);
document.querySelector("#reshuffle-button").addEventListener("click", () => {
  state.order = shuffledOrder(state.size * state.size);
  state.selectedIndex = null;
  state.moves = 0;
  state.startedAt = Date.now();
  document.querySelector("#move-count").textContent = "0";
  renderBoard();
  toast("Puzzle reshuffled.");
});
document.querySelector("#play-again-button").addEventListener("click", beginPuzzle);
document.querySelector("#brand-home").addEventListener("click", () => {
  window.clearInterval(state.timerId);
  state.timerId = null;
  showScreen("home");
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    window.clearInterval(state.timerId);
    state.timerId = null;
    showScreen(button.dataset.action);
  });
});

document.querySelectorAll(".difficulty-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".difficulty-option").forEach((option) => option.classList.remove("is-selected"));
    button.classList.add("is-selected");
    state.size = Number(button.dataset.size);
    state.difficulty = button.dataset.label;
  });
});

const showPreview = () => previewOverlay.classList.add("is-visible");
const hidePreview = () => previewOverlay.classList.remove("is-visible");
previewButton.addEventListener("pointerdown", showPreview);
previewButton.addEventListener("pointerup", hidePreview);
previewButton.addEventListener("pointerleave", hidePreview);
previewButton.addEventListener("keydown", (event) => { if (event.code === "Space" || event.code === "Enter") showPreview(); });
previewButton.addEventListener("keyup", hidePreview);
previewOverlay.addEventListener("pointerup", hidePreview);

document.querySelector("#sound-toggle").addEventListener("click", (event) => {
  state.muted = !state.muted;
  event.currentTarget.setAttribute("aria-pressed", state.muted.toString());
  event.currentTarget.setAttribute("aria-label", state.muted ? "Turn sounds on" : "Mute sounds");
  document.querySelector("#sound-icon").textContent = state.muted ? "×" : "♪";
  document.querySelector("#sound-label").textContent = state.muted ? "Sound off" : "Sound on";
  if (!state.muted) sound("select");
});

window.addEventListener("beforeunload", stopCamera);
