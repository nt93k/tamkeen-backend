from fastapi import APIRouter, Request
from app.services import ai_service

router = APIRouter(tags=["ai-tutor"])

@router.post("/ai/chat")
async def chat_with_ai(request: Request):
    try:
        data = await request.json()
        # التطبيق يرسل النص بكلمة 'message' حسب كود Mentor.tsx
        user_text = data.get("message", "") 
        
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # الرد "يجب" أن يكون بمفتاح 'reply' حصراً
        return {
            "reply": response_text
        }
    except Exception as e:
        print(f"Error: {e}")
        # حتى في الخطأ نرسل 'reply' عشان ما يوقع التطبيق
        return {"reply": "حصل خطأ في معالجة الرد، حاول مرة ثانية."}