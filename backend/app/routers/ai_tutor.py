from fastapi import APIRouter, Request
from app.services import ai_service

# لا نضع prefix هنا لأننا وضعناه في main.py
router = APIRouter(tags=["ai-tutor"])

@router.post("/ai/chat")
async def chat_with_ai(request: Request):
    try:
        # قراءة النص المرسل من التطبيق
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        # الحصول على رد الذكاء الاصطناعي
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # إرجاع الرد بصيغة JSON "مسطحة" جداً
        # التطبيقات غالباً تبحث عن 'message' أو 'response' مباشرة
        return {
            "message": response_text,
            "response": response_text,
            "reply": response_text,
            "status": "success"
        }
    except Exception as e:
        print(f"Error logic: {e}")
        # رد طوارئ يضمن عدم انهيار التطبيق
        return {"message": "أنا متاح لمساعدتك!", "status": "error"}