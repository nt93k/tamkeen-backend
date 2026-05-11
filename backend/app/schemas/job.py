"""
مخططات البيانات للوظائف
"""
from typing import Optional
from pydantic import BaseModel

class JobCreate(BaseModel):
    title: str
    department: str
    required_major: str
    province: str
    min_exam_score: float = 60.0
    min_gpa: float = 0.0
    description: str
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    employment_type: str = "دوام كامل"

class JobResponse(JobCreate):
    id: str
    company_id: str
    
    class Config:
        from_attributes = True
