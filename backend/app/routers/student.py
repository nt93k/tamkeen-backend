"""
مسارات الطالب - تحديث التوافق
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.exam import Exam, ExamResult
from app.models.job import JobPosting
from app.routers.deps import get_current_student
from app.services import exam_service

router = APIRouter(prefix="/student", tags=["student"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    profile = current_user.student_profile
    results = db.query(ExamResult).filter(ExamResult.student_id == profile.id).all()
    
    # جلب الوظائف المتوافقة مع المحافظة
    jobs = db.query(JobPosting).filter(
        JobPosting.province == profile.province,
        JobPosting.is_active == True
    ).limit(5).all()
    
    # جلب الاختبارات المتاحة لتخصصه
    available_exams = db.query(Exam).filter(Exam.major == profile.major).all()
    
    return templates.TemplateResponse(
        request=request,
        name="student/dashboard.html",
        context={
            "current_user": current_user,
            "profile": profile,
            "results": results,
            "jobs": jobs,
            "available_exams": available_exams
        }
    )

@router.get("/exams/{exam_id}", response_class=HTMLResponse)
async def take_exam_page(request: Request, exam_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="الاختبار غير موجود")
    
    return templates.TemplateResponse(
        request=request,
        name="student/exam.html",
        context={"current_user": current_user, "exam": exam}
    )

@router.post("/exams/{exam_id}/submit")
async def submit_exam(exam_id: str, answers: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    result = await exam_service.submit_exam(db, current_user.student_profile.id, exam_id, answers)
    return {"score": result.score, "passed": result.passed, "result_id": result.id}
