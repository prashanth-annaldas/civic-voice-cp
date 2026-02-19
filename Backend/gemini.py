import os
import io
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)


def detect_issue(image_bytes: bytes) -> str:
    if not API_KEY:
        return "unknown"

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        prompt = """
Return ONLY one label:
pothole
garbage
water_leak
street_light
electric_transformer
unknown
"""

        response = model.generate_content([prompt, image])
        text = (response.text or "").lower()

        if "pothole" in text:
            return "Pothole"
        elif "garbage" in text:
            return "Garbage"
        elif "water" in text:
            return "Water Leak"
        elif "light" in text:
            return "Street Light"
        elif "electric" in text:
            return "Electric Transformer"
        else:
            return "unknown"

    except Exception as e:
        print("Gemini error:", e)
        return "unknown"
