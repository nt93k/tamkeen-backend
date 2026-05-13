from fastapi import APIRouter, Request
from app.services import ai_service

# يجب تعريف الـ router أولاً قبل استخدامه
router = APIRouter(prefix="/ai", tags=["ai-tutor"])

@router.post("/chat")
async def chat_with_ai(request: Request):
    try:
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # نرسل كل المفاتيح المحتملة ليرضى الـ Frontend
        return {
            "response": response_text,
            "reply": response_text,
            "message": response_text,
            "content": response_text,
            "status": "success",
            "data": {"reply": response_text}
        }
    except Exception as e:
        return {"response": "أنا متاح لمساعدتك!", "status": "error"}

@router.get("/chat")
async def test_endpoint():
    return {"status": "AI Router is working!"}