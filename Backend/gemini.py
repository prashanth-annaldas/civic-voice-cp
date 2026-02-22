import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)


def detect_issue(image_bytes: bytes) -> str:
    if not API_KEY:
        return "unknown"

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        model = genai.GenerativeModel("gemini-2.5-flash")

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
        elif "transformer" in text:
            return "Electric Transformer"
        else:
            return "unknown"

    except Exception as e:
        import traceback
        traceback.print_exc()
        return "unknown"
