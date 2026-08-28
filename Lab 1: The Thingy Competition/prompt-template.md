# Thingy Prompt: SnapSolve

This file is the running record of the SnapSolve application as it is built.

## What I Am Building

SnapSolve is an interactive puzzle game that turns any image into a puzzle. The user can upload an existing picture or take a new picture using their computer's camera. The application prepares the image as a square without distorting it, divides it into tiles, shuffles the tiles, and lets the user solve the puzzle by rearranging them. The user chooses the difficulty before starting.

The main idea is to make puzzle creation part of the experience. I can point the camera at people or objects in the room, take a picture, and immediately turn that exact moment into a playable puzzle.

## Agreed Implementation

This section records the decisions used in the current version.

- The app uses Flask for a small local Python server.
- The local Flask version uses Pillow to apply phone-camera orientation, make a centered square crop, and resize the photo to 1200 × 1200 pixels. It never stretches the image.
- The public GitHub Pages version performs the same centered square crop in the browser because GitHub Pages cannot run Python. Photos stay on the user's device in both versions.
- The puzzle runs in the browser with HTML, CSS, and JavaScript.
- The player clicks one tile and then another tile to swap them. This is the simplest reliable interaction for a classroom demo and works with a mouse, keyboard, or touch screen.
- The first version keeps photos in browser memory only. It does not upload them to an external service or save them after the page closes.
- The visual style uses warm cream, deep green, coral, and gold. The layout is designed to fit a normal laptop screen and adapt to smaller screens.

## Guidelines

These are standing rules for this project.

### Writing style

Write all text meant for humans in plain English:

- Use plain words and short sentences.
- Write complete sentences with subjects and verbs. Use one idea per sentence.
- Lead with the conclusion. When reporting a problem, first say what to do about it in one sentence. Explain afterward.
- Do not use metaphors or idioms in technical statements. State the literal fact.
- Do not use invented or undefined jargon. Standard technical terms are fine. Define any project-specific term where it first appears.
- Keep code comments short and to the point.

### Working style

- Build the simplest version that works first. Add features only after the simple version runs.
- Record major design decisions in this file as the project changes.
- Report results plainly. If something fails, show the actual error message.
- Keep the application easy to run locally.
- Prioritize a reliable and polished demo over adding many features.
- Do not add major libraries or frameworks unless they provide a clear benefit.
- Make the essential features work before adding optional features.

## Features

### Implemented

- The home screen clearly presents **Upload a Photo** and **Take a Photo**.
- The app accepts JPEG, PNG, and WebP images up to 12 MB.
- The camera flow shows a live preview and a clear capture button.
- The selected or captured image appears before the puzzle starts.
- The difficulty choices are Easy (3 × 3), Medium (4 × 4), Hard (5 × 5), and Expert (6 × 6).
- Pillow uses a centered square crop and does not distort the image.
- The browser divides the prepared image into rectangular tiles.
- The starting arrangement is random and is never already solved.
- The player clicks two tiles to swap them. The selected tile has a clear gold outline and scale change.
- The game tracks moves and time.
- The app automatically detects a solved puzzle.
- The completion screen stops the timer, shows the original image, reports time and moves, and runs a confetti celebration.
- The player can replay the same photo, reshuffle, return to the photo preview, or create a new puzzle.
- The puzzle screen includes a press-and-hold preview button.
- Simple sound cues play for selecting, swapping, taking a photo, and completing a puzzle. A mute button is always visible.
- The layout adapts to normal laptop and smaller screens.
- Errors for missing, unsupported, and oversized images use clear messages.
- A GitHub Actions workflow publishes the site from the `main` branch to `https://vaipujary.github.io/ECE-60141/`.

### Deferred ideas

These remain possible later additions. They are not part of the current version.

- Add a 3… 2… 1… countdown and shutter animation before a camera capture.
- Animate the intact photo breaking into tiles before the puzzle begins.
- Add a separate limited Hint feature and track hints used.
- Add a Memory Challenge mode.
- Add scoring, local best scores, and personal-best messages.
- Replace instant redraws with position-to-position tile movement animations.
- Do not implement interlocking jigsaw shapes unless the rectangular version remains reliable.

## Look and Feel

The application feels playful, polished, and modern. The home screen uses the name **SnapSolve** and the subtitle **Turn any moment into a puzzle.** Two large illustrated choices make the main actions obvious.

The selected image is the visual focus of the setup screen. The difficulty selector is clear without competing with the image. The puzzle is centered and uses nearly gapless tiles. Time, moves, and difficulty stay easy to scan.

The completion screen shows the reconstructed image, final results, replay controls, and a short confetti celebration. The interface avoids clutter and includes short instructions where they help.

## Platform

SnapSolve runs in a normal desktop browser. The local version uses Python, Flask, and Pillow. The public version is hosted on GitHub Pages and uses the browser for image preparation because GitHub Pages serves static files only. The interface uses HTML, CSS, and JavaScript. Photos are processed on the user's device and are not saved or sent to an external image service.

The camera feature uses the browser's built-in camera access and asks for permission when needed. The public site uses HTTPS, which allows modern browsers to request camera access. The `README.md` file contains the public URL, local setup, start, publishing, and test instructions.

## What Done Looks Like

SnapSolve is complete when I can open the application, upload a photo or take one live with my camera, choose a difficulty, and turn the image into a shuffled puzzle that I can solve.

When I finish the puzzle, the application recognizes the solution, reconstructs the original image, shows my time and move count, and displays a completion celebration. I can replay the same image or create another puzzle without restarting the application.

## Reflection

Leave this section empty while building. Fill it in after the demo, just before submission.

### A) Was this fun? Why or why not?

TODO

### B) What did I learn?

TODO

### C) What would I do differently?

TODO
