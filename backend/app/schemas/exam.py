"""
مخططات البيانات للاختبارات
"""
from typing import List, Optional
from pydantic import BaseModel

class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    topic: str

class ExamBase(BaseModel):
    title: str
    major: str
    description: Optional[str] = None
    pass_threshold: float = 60.0

class ExamResponse(ExamBase):
    id: str
    class Config:
        from_attributes = True

class ExamResultResponse(BaseModel):
    id: str
    score: float
    passed: bool
    ai_study_plan: Optional[str] = None
    
    class Config:
        from_attributes = True
