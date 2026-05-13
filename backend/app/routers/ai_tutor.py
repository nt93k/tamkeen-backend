from fastapi import APIRouter, Request
from app.services import ai_service

router = APIRouter(prefix="/chat", tags=["ai-tutor"])

@router.post("/")
async def chat_with_ai(request: Request):
    try:
        # 1. قراءة البيانات
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        # 2. الحصول على رد الذكاء الاصطناعي
        response_text = await ai_service.get_chat_response("General", user_text)
        
        # 3. الرد بـ "كل" الصيغ الممكنة (حتى لو التطبيق قديم أو جديد يشتغل)
        return {
            "response": response_text,
            "message": response_text,
            "reply": response_text,
            "content": response_text,
            "status": "success"
        }
    except Exception as e:
        print(f"Error: {e}")
        # رد طوارئ يمنع الانهيار
        return {"response": "أنا معك، كيف أساعدك؟", "status": "error"}

@router.get("/")
async def test():
    return {"status": "AI is ready"}