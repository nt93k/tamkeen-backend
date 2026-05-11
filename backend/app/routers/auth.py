"""
مسارات المصادقة - تحديث التوافق
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import auth_service
from app.schemas.user import UserCreate, UserLogin
from app.models.user import User, UserRole, StudentProfile, CompanyProfile

router = APIRouter(prefix="/auth", tags=["auth"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="auth/login.html")

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse(request=request, name="auth/register.html")

@router.post("/register")
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    if auth_service.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user = User(
        email=user_in.email,
        hashed_password=auth_service.hash_password(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.flush()

    if user_in.role == UserRole.student:
        profile = StudentProfile(
            user_id=user.id,
            full_name=user_in.full_name,
            university=user_in.university,
            major=user_in.major,
            academic_year=user_in.academic_year,
            province=user_in.province
        )
        db.add(profile)
    else:
        profile = CompanyProfile(
            user_id=user.id,
            company_name=user_in.company_name,
            industry=user_in.industry,
            province=user_in.province
        )
        db.add(profile)
    
    db.commit()
    return {"message": "تم إنشاء الحساب بنجاح"}

@router.post("/login")
async def login(response: Response, user_in: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="البريد الإلكتروني أو كلمة المرور غير صحيحة")
    
    token = auth_service.create_access_token(data={"sub": str(user.id)})
    response.set_cookie(key="access_token", value=token, httponly=True)
    return {"message": "تم تسجيل الدخول بنجاح", "role": user.role}

@router.get("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return RedirectResponse(url="/auth/login")
