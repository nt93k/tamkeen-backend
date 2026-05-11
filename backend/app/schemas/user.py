"""
مخططات البيانات للمستخدمين (Pydantic Schemas)
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole
    full_name: str
    university: str
    major: str
    academic_year: int
    province: str
    # للشركات
    company_name: Optional[str] = None
    industry: Optional[str] = None

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
