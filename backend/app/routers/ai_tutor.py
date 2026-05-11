"""
مسارات المساعد الذكي - تحديث التوافق
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.exam import ExamResult
from app.routers.deps import get_current_student
from app.services import ai_service
router = APIRouter(prefix="/chat", tags=["ai-tutor"])
#router = APIRouter(prefix="/ai-tutor", tags=["ai-tutor"])
templates = Jinja2Templates(directory="app/templates")

@router.get("/", response_class=HTMLResponse)
async def ai_tutor_page(request: Request, current_user: User = Depends(get_current_student)):
    return templates.TemplateResponse(
        request=request,
        name="student/ai_tutor.html",
        context={"current_user": current_user}
    )
@router.post("/chat")
async def chat_with_ai(message: dict):
    # أخذ النص من الرسالة القادمة من التطبيق
    user_text = message.get("text", message.get("message", ""))
    
    # طلب الرد من جيميناي
    response = await ai_service.get_chat_response(
        "General Student", # تخصص افتراضي لأننا عطلنا الـ SQL
        user_text
    )
    
    # إرجاع الرد بنفس الصيغة التي يتوقعها التطبيق
    return {"response": response}
#@router.post("/chat")
#async def chat_with_ai(message: dict, current_user: User = Depends(get_current_student)):
    #response = await ai_service.get_chat_response(
       # current_user.student_profile.major,
       # message.get("text", "")
  #  )
   # return {"response": response}

@router.get("/plan/{result_id}")
async def get_study_plan(result_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    result = db.query(ExamResult).filter(ExamResult.id == result_id, ExamResult.student_id == current_user.student_profile.id).first()
    if not result:
        return {"error": "النتيجة غير موجودة"}
    
    if not result.ai_study_plan:
        plan = await ai_service.generate_study_plan(
            current_user.student_profile.full_name,
            current_user.student_profile.major,
            result.score,
            result.weak_topics or []
        )
        result.ai_study_plan = plan
        result.ai_plan_generated = True
        db.commit()
    
    return {"plan": result.ai_study_plan}
