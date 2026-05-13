from fastapi import APIRouter, Request
from app.services import ai_service

# لا نضع /api هنا لأن الملف الأساسي server.py هو من يضيفها
# نكتفي بـ /ai ليكون المسار النهائي /api/ai/chat
router = APIRouter(prefix="/ai", tags=["ai-tutor"])

@router.post("/chat")
async def chat_with_ai(request: Request):
    try:
        # قراءة البيانات
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        # طلب الرد من الذكاء الاصطناعي
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # التطبيق يتوقع JSON نظيف
        # سنرسل له كل المفاتيح الممكنة لضمان عدم حدوث Error في الـ Frontend
        return {
            "response": response_text,
            "message": response_text,
            "reply": response_text,
            "status": "success"
        }
    except Exception as e:
        # إذا حدث خطأ، نرسل JSON بدل نص عادي حتى لا ينهار JSON.parse في التطبيق
        return {"response": "أنا متاح لمساعدتك الآن", "status": "error"}