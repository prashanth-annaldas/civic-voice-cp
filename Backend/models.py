import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    name = Column(String(255), nullable=True)
    
    # Advanced Platform Fields
    role = Column(String(50), default="USER")
    points = Column(Integer, default=0)
    trust_score = Column(Float, default=100.0)
    badges = Column(String(1000), default="")  # Stored as comma-separated string e.g. "Civic Champion"


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float)
    lng = Column(Float)
    radius = Column(Float, default=50.0) # meters
    issue_count = Column(Integer, default=1)
    severity_score = Column(Integer, default=0)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(100))
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String(50))
    image = Column(String(500))
    description = Column(Text)
    
    # Advanced Platform Fields
    severity_score = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cluster_id = Column(Integer, ForeignKey("clusters.id"), nullable=True)
    confirmations = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    department = Column(String(100), default="Unassigned")
    is_duplicate = Column(Boolean, default=False)
    escalated = Column(Boolean, default=False)


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)


class AreaHealth(Base):
    __tablename__ = "area_health"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float)
    lng = Column(Float)
    score = Column(Float, default=100.0)
    label = Column(String(50), default="Healthy")


class RewardLog(Base):
    __tablename__ = "reward_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    points_awarded = Column(Integer)
    reason = Column(String(500))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
