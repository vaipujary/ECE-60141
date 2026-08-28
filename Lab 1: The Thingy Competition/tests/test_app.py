import io
import unittest

from PIL import Image

from app import create_app


class SnapSolveTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app({"TESTING": True}).test_client()

    def test_home_page(self):
        with self.client.get("/") as response:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Turn any moment", response.data)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.get_json(), {"status": "ok"})

    def test_image_is_center_cropped_and_encoded(self):
        source = io.BytesIO()
        Image.new("RGB", (800, 400), "#ef735d").save(source, "PNG")
        source.seek(0)
        response = self.client.post(
            "/api/prepare-image",
            data={"image": (source, "wide.png")},
            content_type="multipart/form-data",
        )
        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual((payload["width"], payload["height"]), (1200, 1200))
        self.assertTrue(payload["image"].startswith("data:image/jpeg;base64,"))

    def test_invalid_file_has_clear_error(self):
        response = self.client.post(
            "/api/prepare-image",
            data={"image": (io.BytesIO(b"not an image"), "notes.txt")},
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("supported image", response.get_json()["error"])


if __name__ == "__main__":
    unittest.main()
