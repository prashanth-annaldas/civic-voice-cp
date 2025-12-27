from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from gemini import detect_issue
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

issues = []


@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...),
    description: str = Form("")
):
    try:
        image_bytes = await file.read()

        # Save image
        filename = f"{UPLOAD_DIR}/{uuid.uuid4()}.jpg"
        with open(filename, "wb") as f:
            f.write(image_bytes)

        label = detect_issue(image_bytes)

        issue = {
            "type": label,
            "lat": lat,
            "lng": lng,
            "status": "Pending",
            "image": filename,
            "description": description,
        }

        issues.append(issue)

        return {
            "success": True,
            "issue": issue
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get("/issues")
def get_issues():
    return issues
