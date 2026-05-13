from fastapi import APIRouter, Request
from app.services import ai_service

# جعل الـ prefix بسيط ومطابق لما يطلبه التطبيق
router = APIRouter(prefix="/chat", tags=["ai-tutor"])

@router.post("/") # لاحظ هنا جعلناها "/" لأن الـ prefix هو "/chat"
async def chat_with_ai(request: Request):
    try:
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        # نرسل أي نص افتراضي للتخصص لأن الحماية معطلة
        response = await ai_service.get_chat_response("General Student", user_text)
        
        return {
            "response": response,
            "status": "success"
        }
    except Exception as e:
        return {"response": f"خطأ: {str(e)}", "status": "error"}

# هذا المسار للـ GET لو ردت تفتح الرابط بالمتصفح مباشرة
@router.get("/")
async def test_ai():
    return {"message": "AI Tutor is online and open!"}