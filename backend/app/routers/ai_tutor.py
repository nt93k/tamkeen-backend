from fastapi import APIRouter, Request
from app.services import ai_service

router = APIRouter(tags=["ai-tutor"])

@router.post("/ai/chat")
async def chat_with_ai(request: Request):
    try:
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # نرسل الرد مع "بيانات وهمية" للمستخدم حتى لا ينهار الفرونت إيند
        return {
            "message": response_text,
            "response": response_text,
            "reply": response_text,
            "status": "success",
            # بيانات وهمية لإرضاء كود الشاشة
            "user": {
                "id": "1",
                "full_name": "عباس  ",
                "specialization": "عام"
            },
            "created_at": "2026-05-13T00:00:00"
        }
    except Exception as e:
        return {"message": "أنا معك، كيف أساعدك؟", "status": "error"}