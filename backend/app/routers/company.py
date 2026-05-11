"""
مسارات الشركات - تحديث التوافق
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.job import JobPosting
from app.models.exam import ExamResult
from app.routers.deps import get_current_company
from app.schemas.job import JobCreate

router = APIRouter(prefix="/company", tags=["company"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/dashboard", response_class=HTMLResponse)
async def company_dashboard(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_company)):
    profile = current_user.company_profile
    jobs = db.query(JobPosting).filter(JobPosting.company_id == profile.id).all()
    active_jobs = len([j for j in jobs if j.is_active])
    
    return templates.TemplateResponse(
        request=request,
        name="company/dashboard.html",
        context={"current_user": current_user, "profile": profile, "jobs": jobs, "active_jobs": active_jobs}
    )

@router.get("/jobs/new", response_class=HTMLResponse)
async def post_job_page(request: Request, current_user: User = Depends(get_current_company)):
    return templates.TemplateResponse(
        request=request,
        name="company/post_job.html",
        context={"current_user": current_user}
    )

@router.post("/jobs")
async def create_job(job_in: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_company)):
    job = JobPosting(
        company_id=current_user.company_profile.id,
        **job_in.dict()
    )
    db.add(job)
    db.commit()
    return {"message": "تم نشر الوظيفة بنجاح"}

@router.get("/jobs/{job_id}/applicants", response_class=HTMLResponse)
async def view_applicants(request: Request, job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_company)):
    job = db.query(JobPosting).filter(JobPosting.id == job_id, JobPosting.company_id == current_user.company_profile.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="الوظيفة غير موجودة")
    
    # البحث عن المتقدمين المؤهلين (بناءً على التخصص والدرجة والمحافظة)
    applicants = db.query(ExamResult).join(ExamResult.student).filter(
        ExamResult.score >= job.min_exam_score,
        ExamResult.passed == True,
        ExamResult.student.has(major=job.required_major),
        ExamResult.student.has(province=job.province)
    ).all()
    
    return templates.TemplateResponse(
        request=request,
        name="company/applicants.html",
        context={"current_user": current_user, "job": job, "applicants": applicants}
    )
