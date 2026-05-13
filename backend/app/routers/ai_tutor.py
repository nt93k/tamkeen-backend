@router.post("/chat")
async def chat_with_ai(request: Request):
    try:
        data = await request.json()
        user_text = data.get("text") or data.get("message") or ""
        
        # استدعاء جيميناي
        response_text = await ai_service.get_chat_response("General", user_text)
        
        # إرجاع الرد بصيغ متعددة (قاموس، نص، وقائمة)
        # هذا يمنع الـ Frontend من الانهيار مهما كان المفتاح الذي يبحث عنه
        return {
            "response": response_text,       # الاحتمال 1
            "reply": response_text,          # الاحتمال 2
            "message": response_text,        # الاحتمال 3
            "content": response_text,        # الاحتمال 4
            "text": response_text,           # الاحتمال 5
            "status": "success",
            "data": {"reply": response_text} # بعض التطبيقات تبحث داخل كلمة data
        }
    except Exception as e:
        print(f"Chat Error: {e}")
        return {"response": "أنا معك، اسألني أي شيء!"}