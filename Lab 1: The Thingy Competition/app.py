"""Local Flask server for SnapSolve."""

from __future__ import annotations

import base64
import io
import os

from flask import Flask, jsonify, request, send_from_directory
from PIL import Image, ImageOps, UnidentifiedImageError


MAX_UPLOAD_BYTES = 12 * 1024 * 1024
OUTPUT_SIZE = 1200
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(MAX_CONTENT_LENGTH=MAX_UPLOAD_BYTES)
    if test_config:
        app.config.update(test_config)

    @app.get("/")
    def index():
        return send_from_directory(BASE_DIR, "index.html")

    @app.get("/og.png")
    def social_preview():
        return send_from_directory(BASE_DIR, "og.png")

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    @app.post("/api/prepare-image")
    def prepare_image():
        upload = request.files.get("image")
        if upload is None or not upload.filename:
            return jsonify(error="Choose or capture an image first."), 400

        try:
            source = Image.open(upload.stream)
            source.load()
        except (UnidentifiedImageError, OSError):
            return jsonify(error="That file is not a supported image."), 400

        if source.format not in ALLOWED_FORMATS:
            return jsonify(error="Use a JPEG, PNG, or WebP image."), 400

        # Respect phone-camera orientation, then make a centered square crop.
        source = ImageOps.exif_transpose(source).convert("RGB")
        prepared = ImageOps.fit(
            source,
            (OUTPUT_SIZE, OUTPUT_SIZE),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )

        output = io.BytesIO()
        prepared.save(output, format="JPEG", quality=90, optimize=True)
        encoded = base64.b64encode(output.getvalue()).decode("ascii")
        return jsonify(
            image=f"data:image/jpeg;base64,{encoded}",
            width=OUTPUT_SIZE,
            height=OUTPUT_SIZE,
        )

    @app.errorhandler(413)
    def upload_too_large(_error):
        return jsonify(error="That image is too large. Choose one under 12 MB."), 413

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)
