from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
import os
import uuid

from gemini import detect_issue
from email_service import send_issue_email
from database import engine, SessionLocal, Base
from models import Issue, User
from schemas import RegisterRequest
from auth_utils import hash_password, verify_password, create_access_token

from google.oauth2 import id_token
from google.auth.transport import requests

# ---------------- APP INIT ----------------
app = FastAPI()

@app.get("/")
def home():
    return {"status": "CivicVoice Backend Running 🚀"}



# ---------------- STARTUP EVENT ----------------
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- FILE UPLOAD SETUP ----------------
UPLOAD_DIR = "/tmp/uploads"  # IMPORTANT for Render
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------------- DATABASE DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- REQUEST MODEL ----------------
class RequestIn(BaseModel):
    description: str
    latitude: float
    longitude: float


class GoogleTokenRequest(BaseModel):
    token: str


# ---------------- REGISTER USER ----------------
@app.post("/register", status_code=201)
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    hashed_password = hash_password(data.password)

    user = User(
        email=data.email,
        password=hashed_password
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    return {
        "message": "User registered successfully",
        "email": user.email
    }


# ---------------- LOGIN USER ----------------
@app.post("/login")
def login_user(data: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }


# ---------------- GOOGLE LOGIN ----------------
@app.post("/google-login")
def google_login(data: GoogleTokenRequest, db: Session = Depends(get_db)):
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            data.token, requests.Request()
            # If you want to strictly verify the client ID, pass it here:
            # audience="YOUR_GOOGLE_CLIENT_ID_HERE" 
        )

        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create a new user with a random unguessable password
            random_password = str(uuid.uuid4())
            hashed_password = hash_password(random_password)
            user = User(
                email=email,
                password=hashed_password
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate our own application token
        access_token = create_access_token(
            data={"sub": str(user.id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")


# ---------------- CREATE MANUAL REQUEST ----------------
@app.post("/requests")
def create_request(data: RequestIn, db: Session = Depends(get_db)):
    issue = Issue(
        description=data.description,
        lat=data.latitude,
        lng=data.longitude,
        status="Pending",
        type="Manual"
    )

    db.add(issue)
    db.commit()
    db.refresh(issue)

    try:
        send_issue_email({
            "description": data.description,
            "lat": data.latitude,
            "lng": data.longitude,
            "status": "Pending",
            "type": "Manual"
        })
    except Exception as e:
        print("Email failed:", e)

    return {"msg": "Request stored & email sent"}


# ---------------- UPLOAD ISSUE ----------------
@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...),
    description: str = Form(""),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await file.read()

        filename = f"{UPLOAD_DIR}/{uuid.uuid4()}.jpg"

        with open(filename, "wb") as f:
            f.write(image_bytes)

        label = detect_issue(image_bytes)

        issue = Issue(
            type=label,
            lat=lat,
            lng=lng,
            status="Pending",
            image=filename,
            description=description
        )

        db.add(issue)
        db.commit()
        db.refresh(issue)

        try:
            send_issue_email(
                {
                    "type": label,
                    "lat": lat,
                    "lng": lng,
                    "status": "Pending",
                    "description": description
                },
                filename
            )
        except Exception as e:
            print("Email failed:", e)

        return {
            "success": True,
            "issue": {
                "id": issue.id,
                "type": issue.type,
                "lat": issue.lat,
                "lng": issue.lng,
                "status": issue.status,
                "image": issue.image,
                "description": issue.description,
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ---------------- GET ALL ISSUES ----------------
@app.get("/issues")
def get_issues(db: Session = Depends(get_db)):
    issues = db.query(Issue).all()

    return [
        {
            "id": issue.id,
            "lat": issue.lat,
            "lng": issue.lng,
            "type": issue.type,
            "status": issue.status,
            "description": issue.description,
            "image": issue.image,
        }
        for issue in issues
    ]
