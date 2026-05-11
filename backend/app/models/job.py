"""
نموذج إعلانات الوظائف - نسخة متوافقة مع SQLite
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Float,
    ForeignKey, Text, Integer
)
from sqlalchemy.orm import relationship
from app.database import Base

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    department = Column(String(100), nullable=False)
    required_major = Column(String(100), nullable=False)
    province = Column(String(100), nullable=False)
    min_exam_score = Column(Float, default=60.0)
    min_gpa = Column(Float, default=0.0)
    min_academic_year = Column(Integer, default=1)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    salary_range = Column(String(100), nullable=True)
    employment_type = Column(String(50), default="دوام كامل")
    is_active = Column(Boolean, default=True)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("CompanyProfile", back_populates="job_postings")
