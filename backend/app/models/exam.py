"""
نماذج الاختبارات والأسئلة والنتائج - نسخة متوافقة مع SQLite
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Float,
    Integer, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Exam(Base):
    __tablename__ = "exams"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(300), nullable=False)
    major = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    pass_threshold = Column(Float, default=60.0)
    time_limit_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    results = relationship("ExamResult", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    exam_id = Column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(1), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(20), default="متوسط")
    order_num = Column(Integer, default=0)

    exam = relationship("Exam", back_populates="questions")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(String(36), ForeignKey("exams.id"), nullable=False)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    weak_topics = Column(JSON, nullable=True) # تم التغيير من ARRAY لـ JSON
    answers_json = Column(Text, nullable=True)
    ai_study_plan = Column(Text, nullable=True)
    ai_plan_generated = Column(Boolean, default=False)
    taken_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="exam_results")
    exam = relationship("Exam", back_populates="results")
