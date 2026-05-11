"""
نماذج المستخدمين - نسخة متوافقة مع SQLite
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Float,
    Integer, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    student = "student"
    company = "company"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    company_profile = relationship("CompanyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    university = Column(String(200), nullable=False)
    major = Column(String(100), nullable=False)
    academic_year = Column(Integer, nullable=False)
    province = Column(String(100), nullable=False)
    gpa = Column(Float, nullable=True)
    phone = Column(String(20), nullable=True)
    bio = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    exam_results = relationship("ExamResult", back_populates="student", cascade="all, delete-orphan")

class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    industry = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    description = Column(String(1000), nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    established_year = Column(Integer, nullable=True)
    employee_count = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="company_profile")
    job_postings = relationship("JobPosting", back_populates="company", cascade="all, delete-orphan")
