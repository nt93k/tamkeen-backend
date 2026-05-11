"""
خدمة الذكاء الاصطناعي — Google Gemini API
يتم تحميل المفتاح بشكل آمن من ملف .env عبر إعدادات التطبيق
"""
import google.generativeai as genai
from typing import List, Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# ─── تهيئة Gemini API مرة واحدة عند بدء التطبيق ──────────────────────────
def _configure_gemini():
    """تهيئة مكتبة Gemini باستخدام المفتاح المحمّل بأمان من .env"""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    logger.info("✅ تم تهيئة Gemini API بنجاح")

_configure_gemini()

# ─── اختيار النموذج ───────────────────────────────────────────────────────
GEMINI_MODEL = "gemini-1.5-flash"

GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 4096,
}

SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


def _get_model():
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config=GENERATION_CONFIG,
        safety_settings=SAFETY_SETTINGS,
    )


# ─── خطة الدراسة المخصصة ─────────────────────────────────────────────────
def generate_study_plan(
    major: str,
    score: float,
    weak_topics: List[str],
    student_name: str = "الطالب",
    academic_year: int = 1,
) -> str:
    """
    توليد خطة دراسية مخصصة باللغة العربية بناءً على نتائج الاختبار.
    يُستدعى هذا فقط عندما يرسب الطالب في الاختبار.
    """
    weak_topics_str = "، ".join(weak_topics) if weak_topics else "عام في جميع المواضيع"

    prompt = f"""
أنت مساعد تعليمي متخصص للطلاب العراقيين الجامعيين. أجب دائماً باللغة العربية الفصحى بأسلوب مشجع ومحفز.

معلومات الطالب:
- الاسم: {student_name}
- التخصص الدراسي: {major}
- السنة الدراسية: {academic_year}
- درجة اختبار التأهيل: {score:.1f}% (لم يتجاوز الحد المطلوب)
- المواضيع التي تحتاج إلى تحسين: {weak_topics_str}

المطلوب منك: أنشئ خطة دراسية مخصصة ومفصلة تشمل العناصر التالية بالضبط:

## 1. تحليل الأداء
اكتب تحليلاً موجزاً ومشجعاً لأداء الطالب وأهمية التحسين.

## 2. المواضيع الأولوية
اذكر المواضيع التي يجب التركيز عليها مع شرح مختصر لكل موضوع.

## 3. خطة الدراسة الأسبوعية (4 أسابيع)
قدم جدولاً أسبوعياً تفصيلياً:
- الأسبوع الأول: ...
- الأسبوع الثاني: ...
- الأسبوع الثالث: ...
- الأسبوع الرابع: (مراجعة شاملة + اختبارات تجريبية)

## 4. مصادر التعلم الموصى بها
اذكر مصادر تعليمية مجانية وموثوقة (كتب، منصات، قنوات يوتيوب، مواقع).

## 5. أسئلة تدريبية
قدم 5 أسئلة تدريبية لكل موضوع ضعيف مع الإجابات النموذجية.

## 6. نصائح الاختبار
قدم 5 نصائح عملية للنجاح في اختبار التأهيل التالي.

اكتب بأسلوب إيجابي ومحفز، وتجنب الإحباط. الطالب قادر على النجاح!
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"خطأ في Gemini API: {e}")
        return _fallback_study_plan(major, weak_topics, score)


# ─── المحادثة مع المساعد الذكي ────────────────────────────────────────────
def chat_with_tutor(
    message: str,
    major: str,
    chat_history: List[dict],
    student_name: str = "الطالب",
) -> str:
    """
    محادثة تفاعلية مع المساعد الذكي للتخصص الدراسي
    """
    system_context = f"""
أنت مساعد تعليمي ذكي متخصص في تخصص {major} للطلاب العراقيين الجامعيين.
اسم الطالب: {student_name}

قواعد المحادثة:
1. أجب دائماً باللغة العربية الفصحى
2. كن متخصصاً في {major} ومجالاته
3. قدم إجابات علمية دقيقة ومفهومة
4. استخدم أمثلة عملية من السياق العراقي والعربي
5. شجع الطالب وكن إيجابياً
6. إذا كان السؤال خارج نطاق {major}، أعد توجيه الطالب بلطف
"""

    # بناء تاريخ المحادثة
    history = []
    for msg in chat_history[-10:]:  # آخر 10 رسائل فقط
        role = "user" if msg.get("role") == "user" else "model"
        history.append({"role": role, "parts": [msg.get("content", "")]})

    try:
        model = _get_model()
        chat = model.start_chat(history=history)
        full_message = f"{system_context}\n\nسؤال الطالب: {message}"
        response = chat.send_message(full_message)
        return response.text
    except Exception as e:
        logger.error(f"خطأ في محادثة Gemini: {e}")
        return "عذراً، حدث خطأ تقني مؤقت. يرجى المحاولة مرة أخرى بعد لحظات."


# ─── توليد أسئلة تدريبية ───────────────────────────────────────────────────
def generate_practice_exam(major: str, topic: str, num_questions: int = 5) -> str:
    """توليد أسئلة اختبار تدريبي باللغة العربية"""
    prompt = f"""
أنت أستاذ جامعي متخصص في {major}.
أنشئ {num_questions} أسئلة اختيار من متعدد باللغة العربية حول موضوع: {topic}

لكل سؤال، اتبع هذا التنسيق بالضبط:

**السؤال [رقم]: [نص السؤال]**
أ) [الخيار الأول]
ب) [الخيار الثاني]
ج) [الخيار الثالث]
د) [الخيار الرابع]
✅ الإجابة الصحيحة: [الحرف] - [تفسير مختصر]

---

المتطلبات:
- الأسئلة يجب أن تكون متنوعة الصعوبة (سهل، متوسط، صعب)
- ركز على المفاهيم الأساسية والتطبيقية
- الإجابات يجب أن تكون واضحة وغير ملتبسة
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"خطأ في توليد الأسئلة: {e}")
        return f"عذراً، تعذّر توليد الأسئلة التدريبية في الوقت الحالي. يرجى المحاولة لاحقاً."


# ─── خطة احتياطية عند فشل API ─────────────────────────────────────────────
def _fallback_study_plan(major: str, weak_topics: List[str], score: float) -> str:
    """خطة دراسية احتياطية عند تعذّر الاتصال بـ Gemini"""
    topics_str = "، ".join(weak_topics) if weak_topics else "المواضيع العامة"
    return f"""
## خطة دراسية مخصصة — تخصص {major}

### تحليل الأداء
حصلت على درجة {score:.1f}%، وأنت قريب من تحقيق النجاح! مع الاستمرار والمثابرة ستصل إلى هدفك.

### المواضيع التي تحتاج إلى مراجعة
{topics_str}

### خطة الدراسة الأسبوعية
- **الأسبوع الأول:** مراجعة المفاهيم الأساسية للمواضيع الضعيفة
- **الأسبوع الثاني:** حل التمارين والأسئلة التطبيقية
- **الأسبوع الثالث:** مراجعة شاملة وأسئلة نموذجية
- **الأسبوع الرابع:** اختبارات تجريبية والاستعداد للاختبار الفعلي

### نصائح للنجاح
1. خصص 2-3 ساعات يومياً للدراسة
2. ابدأ بالمفاهيم الأساسية قبل الانتقال للمتقدمة
3. حل أسئلة الاختبارات السابقة
4. لا تتردد في طرح أسئلتك على المساعد الذكي
5. خذ فترات راحة منتظمة أثناء الدراسة

حظاً موفقاً في اختبارك القادم! 🌟
"""
