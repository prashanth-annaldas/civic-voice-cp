from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
import os
import uuid

from gemini import detect_issue
from ai_engine import analyze_issue
from email_service import send_issue_email
from database import engine, SessionLocal, Base
from models import Issue, User, Cluster
from schemas import RegisterRequest
from auth_utils import hash_password, verify_password, create_access_token, ALGORITHM, SECRET_KEY
from jose import jwt, JWTError

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
    allow_origins=[
        "http://localhost:5173",
        "https://civic-voice-project.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("Unhandled Exception:", exc)
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*"), "Access-Control-Allow-Credentials": "true"}
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


# ---------------- AUTH DEPENDENCY ----------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# ---------------- REQUEST MODEL ----------------
class RequestIn(BaseModel):
    description: str
    latitude: float
    longitude: float


class GoogleTokenRequest(BaseModel):
    token: str


class UserUpdateModel(BaseModel):
    name: str


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


# ---------------- USER PROFILE ROUTE ----------------
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "points": current_user.points,
        "trust_score": current_user.trust_score,
        "badges": current_user.badges.split(",") if current_user.badges else []
    }


@app.put("/me")
def update_me(data: UserUpdateModel, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.name = data.name
    db.commit()
    db.refresh(current_user)
    return {
        "message": "User name updated successfully",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name
        }
    }


# ---------------- CREATE MANUAL REQUEST ----------------
@app.post("/requests")
def create_request(data: RequestIn, request: Request, db: Session = Depends(get_db)):
    uploader_id = None
    user_email = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            uid = payload.get("sub")
            user = db.query(User).filter(User.id == uid).first()
            if user:
                uploader_id = user.id
                user_email = user.email
        except Exception as e:
            print("Token warning:", e)

    issue = Issue(
        description=data.description,
        lat=data.latitude,
        lng=data.longitude,
        status="Pending",
        type="Manual",
        user_id=uploader_id
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
        }, user_email=user_email)
    except Exception as e:
        print("Email failed:", e)

    return {"msg": "Request stored & email sent"}


# ---------------- UPLOAD ISSUE ----------------
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2.0)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(delta_lambda/2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.post("/upload")
async def upload(
    request: Request,
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

        # Geo-Clustering Logic
        existing_issues = db.query(Issue).filter(Issue.status != "Resolved").all()
        nearby_issues = [iss for iss in existing_issues if haversine(lat, lng, iss.lat, iss.lng) <= 50]
        
        # Determine User for Points
        uploader_id = None
        user_email = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                uid = payload.get("sub")
                user = db.query(User).filter(User.id == uid).first()
                if user:
                    uploader_id = user.id
                    user_email = user.email
                    user.points += 10
                    # Check for badges
                    if user.points >= 100 and "Civic Champion" not in user.badges:
                        user.badges += "Civic Champion,"
                    from models import RewardLog
                    db.add(RewardLog(user_id=uploader_id, points_awarded=10, reason="Reported new issue"))
            except Exception as e:
                print("Token warning:", e)

        # AI Analysis
        ai_data = analyze_issue(image_bytes, lat, lng, len(nearby_issues), description)
        
        if ai_data.get("is_fake"):
            return JSONResponse(status_code=400, content={"error": "Fake upload detected: Image GPS does not match reported location."})

        # Cluster Resolution
        cluster_id = None
        if nearby_issues:
            # Join the first existing cluster or create one explicitly
            parent_issue = nearby_issues[0]
            if not parent_issue.cluster_id:
                # Create a new cluster since parent isn't part of one
                new_cluster = Cluster(lat=parent_issue.lat, lng=parent_issue.lng, issue_count=1, severity_score=parent_issue.severity_score)
                db.add(new_cluster)
                db.commit()
                db.refresh(new_cluster)
                parent_issue.cluster_id = new_cluster.id
                cluster_id = new_cluster.id
            else:
                cluster_id = parent_issue.cluster_id
                cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
                if cluster:
                    cluster.issue_count += 1
                    cluster.severity_score = max(cluster.severity_score, ai_data["severity_score"])
        else:
            # Create a cluster for this single issue right away to simplify future merges
            new_cluster = Cluster(lat=lat, lng=lng, issue_count=1, severity_score=ai_data["severity_score"])
            db.add(new_cluster)
            db.commit()
            db.refresh(new_cluster)
            cluster_id = new_cluster.id

        is_dup = len(nearby_issues) > 0

        # Save Issue
        issue = Issue(
            type=ai_data["issue_type"],
            lat=lat,
            lng=lng,
            status="Pending",
            image=filename,
            description=description,
            severity_score=ai_data["severity_score"],
            department=ai_data["department"],
            cluster_id=cluster_id,
            is_duplicate=is_dup,
            escalated=(ai_data["severity_score"] >= 85),
            user_id=uploader_id
        )

        db.add(issue)
        db.commit()
        db.refresh(issue)

        try:
            send_issue_email(
                {
                    "type": ai_data["issue_type"],
                    "lat": lat,
                    "lng": lng,
                    "status": "Pending",
                    "description": description,
                    "severity": ai_data["severity_score"],
                    "department": ai_data["department"]
                },
                filename,
                user_email=user_email
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
                "severity_score": issue.severity_score,
                "department": issue.department,
                "cluster_id": issue.cluster_id,
                "is_duplicate": issue.is_duplicate,
                "escalated": issue.escalated
            }
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------------- GENERATE DESCRIPTION (AI) ----------------
@app.post("/generate-description")
async def api_generate_description(
    file: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...)
):
    try:
        from ai_engine import generate_description
        image_bytes = await file.read()
        description = generate_description(image_bytes, lat, lng)
        return {"description": description}
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

# ---------------- COMMUNITY SENTIMENT INTELLIGENCE ----------------
@app.get("/city-mood")
def get_city_mood(db: Session = Depends(get_db)):
    import google.generativeai as genai
    import os
    import json
    
    API_KEY = os.getenv("GOOGLE_API_KEY")
    if not API_KEY:
        return {"mood_score": 50, "frustration_patterns": ["AI unavailable"], "summary": "N/A"}
        
    recent_issues = db.query(Issue).order_by(Issue.id.desc()).limit(20).all()
    descriptions = [iss.description for iss in recent_issues if iss.description.strip()]
    
    if not descriptions:
        return {
            "mood_score": 85,
            "frustration_patterns": ["No active complaints"],
            "summary": "The city seems quiet and peaceful currently."
        }
        
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        Analyze the following recent citizen complaints to determine the overall "City Mood Index" (0-100, where 100 is perfectly happy and 0 is extremely frustrated/angry).
        Extract common frustration patterns from the text.
        
        Complaints:
        {json.dumps(descriptions)}
        
        Output exact JSON only with these keys:
        - mood_score (int)
        - frustration_patterns (list of strings, e.g. "Frequent water leaks", "Anger about potholes")
        - summary (1-2 sentences summarizing the public sentiment)
        """
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        return parsed
    except Exception as e:
        print("Mood API Error:", e)
        return {
            "mood_score": 50,
            "frustration_patterns": ["Failed to analyze sentiment"],
            "summary": "Error calculating mood."
        }

# ---------------- CIVIC ANALYTICS ENDPOINTS ----------------
from sqlalchemy import func

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_issues = db.query(Issue).count()
    resolved_issues = db.query(Issue).filter(Issue.status == "Resolved").count()
    
    # Issue types distribution
    issue_types = db.query(Issue.type, func.count(Issue.id)).group_by(Issue.type).all()
    type_distribution = [{"name": t[0], "value": t[1]} for t in issue_types]

    # Department distribution
    dept_distribution = db.query(Issue.department, func.count(Issue.id)).group_by(Issue.department).all()

    avg_resolution_time = "48h" # Placeholder for complex timestamp diff query

    return {
        "total_issues": total_issues,
        "resolved_issues": resolved_issues,
        "type_distribution": type_distribution,
        "department_distribution": [{"department": d[0], "count": d[1]} for d in dept_distribution],
        "avg_resolution_time": avg_resolution_time,
        "health_score": 85 if total_issues == 0 else max(10, 100 - (total_issues - resolved_issues) * 2)
    }

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.points.desc()).limit(10).all()
    return [{"id": u.id, "name": u.name or "Citizen", "points": u.points, "badges": u.badges.split(",") if u.badges else []} for u in users]

@app.get("/predictive-risks")
def get_predictive_risks(db: Session = Depends(get_db)):
    # Find active clusters with multiple issues
    high_risk_clusters = db.query(Cluster).filter(Cluster.status != "Resolved", Cluster.issue_count >= 3).all()
    risks = []
    for c in high_risk_clusters:
        probability = min(99.0, 40.0 + (c.issue_count * 10.0) + float(c.severity_score or 0) / 2.0)
        risks.append({
            "lat": c.lat,
            "lng": c.lng,
            "issue_count": c.issue_count,
            "severity_score": c.severity_score,
            "failure_probability_percent": int(probability),
            "alert_message": f"High risk area detected: {c.issue_count} similar complaints. Structural failure probability {int(probability)}%."
        })
    return risks

@app.get("/area-health")
def get_area_health(db: Session = Depends(get_db)):
    clusters = db.query(Cluster).all()
    areas = []
    for c in clusters:
        score = 100.0 - (float(c.severity_score or 0) * 0.5) - (c.issue_count * 5.0)
        score = max(0.0, score)
        label = "Healthy"
        if score < 40: label = "Critical"
        elif score < 70: label = "At Risk"
        elif score < 90: label = "Moderate"
        
        areas.append({
            "lat": c.lat,
            "lng": c.lng,
            "score": score,
            "label": label
        })
    return areas

# ---------------- AI CHATBOT REPORTING ASSISTANT ----------------
class ChatbotRequest(BaseModel):
    message: str

@app.post("/chatbot/parse")
def chatbot_parse(data: ChatbotRequest):
    import google.generativeai as genai
    import os
    import json
    
    API_KEY = os.getenv("GOOGLE_API_KEY")
    if not API_KEY:
        return {"error": "AI not configured"}
        
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        You are a smart city assistant. Extract the following details from this citizen complaint:
        "{data.message}"
        
        Output exact JSON only with these keys:
        - issue_type (Pothole, Garbage, Water Leak, Street Light, etc.)
        - location (any address, landmark, or street mentioned)
        - urgency (Low, Medium, High based on tone and danger)
        - description (a clean summary of the issue)
        """
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        return {"parsed": parsed, "message": "I found these details. Would you like to submit this report?"}
    except Exception as e:
        return {"error": str(e)}
