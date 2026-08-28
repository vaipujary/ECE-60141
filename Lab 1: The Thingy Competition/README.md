# SnapSolve

SnapSolve turns an uploaded or camera photo into a tile-swapping puzzle. It runs locally in a desktop web browser and does not need an internet connection after setup.

## Open the public site

Visit [https://vaipujary.github.io/ECE-60141/](https://vaipujary.github.io/ECE-60141/). The public version prepares photos inside the browser. Photos do not leave the device.

## Set up the app

1. Open a terminal in the `Lab 1: The Thingy Competition` folder.
2. Create a virtual environment:

   ```bash
   python3 -m venv .venv
   ```

3. Activate it:

   ```bash
   source .venv/bin/activate
   ```

4. Install the required packages:

   ```bash
   python -m pip install -r requirements.txt
   ```

## Start the app

```bash
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in Chrome, Edge, Firefox, or Safari. Keep the terminal open while you play.

The browser will ask for camera access when you choose **Take a Photo**. Camera access works on the local address above.

The local Flask version uses Pillow to prepare uploaded images. The GitHub Pages version uses the browser's image tools because GitHub Pages hosts static files only.

## Publish updates

Push changes to the `main` branch on GitHub. The GitHub Pages workflow publishes the contents of this folder automatically.

## Play

Upload a photo or take one with the camera. Choose a difficulty, then select **Shuffle & start**. Click one tile and then another tile to swap them.

## Run the checks

With the virtual environment active, run:

```bash
python -m unittest discover -s tests
```
