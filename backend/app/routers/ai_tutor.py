from fastapi import APIRouter, Request
from app.services import ai_service

router = APIRouter(tags=["ai-tutor"])

@router.post("/ai/chat")
async def chat_with_ai(request: Request):
    try:
        # قراءة البيانات المرسلة
        data = await request.json()
        user_text = data.get("message") or data.get("text") or ""
        
        # استدعاء الذكاء الاصطناعي
        response_text = await ai_service.get_chat_response("General Student", user_text)
        
        # الرد بالصيغة التي ينتظرها ملف Mentor.tsx بالضبط
        return {
            "reply": response_text  # هذا هو المفتاح السحري المطلوب
        }
        
    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "عذراً، حدث خطأ بسيط. أنا معك الآن، تفضل بسؤالك."}