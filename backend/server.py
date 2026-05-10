import sys
#import os
import os
os.environ["EMERGENT_LLM_KEY"] = "dummy"
os.environ["OPENAI_API_KEY"] = "dummy"
# هذا السطر يخبر السيرفر أن ينظر للمجلد الرئيسي بحثاً عن المكتبات
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import httpx
import asyncio
import random
import resend
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

#from emergentintegrations.llm.chat import LlmChat, UserMessage

# ============ DB ============
#mongo_url = os.environ['MONGO_URL']
#client = AsyncIOMotorClient(mongo_url)
client = AsyncIOMotorClient("mongodb+srv://ai0049_db_user:hg8PW7rSDZ6SklZL@cluster0.hvkmjgb.mongodb.net/?appName=Cluster0")
db = client.get_database("tamkeen_db") # تأكد أن هذا السطر موجود تحت الـ client مباشرة
#db = client[os.environ['DB_NAME']]

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret_for_local_testing")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
#EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
GEMINI_MODEL = "gemini-3.1-pro-preview"

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
APP_NAME = os.environ.get('APP_NAME', 'Tamkeen')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

async def send_otp_email(to_email: str, code: str, purpose: str = "verify"):
    title = "تأكيد البريد الإلكتروني" if purpose == "verify" else "إعادة تعيين كلمة السر"
    sub = "أكمل التسجيل بإدخال الرمز" if purpose == "verify" else "استخدم هذا الرمز لتعيين كلمة سر جديدة"
    html = f"""
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fafafa">
      <div style="background:#fff;border-radius:24px;padding:40px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04)">
        <div style="font-size:36px;font-weight:800;color:#0033CC;letter-spacing:-1px">{APP_NAME}</div>
        <div style="height:1px;background:#eee;margin:24px 0"></div>
        <h2 style="color:#0a0a0a;font-size:20px;margin:0 0 8px">{title}</h2>
        <p style="color:#52525B;margin:0 0 28px">{sub}</p>
        <div style="background:#E6ECFF;border-radius:16px;padding:24px;display:inline-block;min-width:240px">
          <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0033CC;font-family:monospace">{code}</div>
        </div>
        <p style="color:#A1A1AA;font-size:13px;margin-top:28px">صالح لمدة 10 دقائق فقط. لا تشاركه مع أحد.</p>
      </div>
      <p style="color:#A1A1AA;font-size:11px;text-align:center;margin-top:16px">© {APP_NAME} • منصة التعليم والتوظيف الذكي</p>
    </div>
    """
    if not RESEND_API_KEY:
        logger = logging.getLogger(__name__)
        logger.warning(f"[OTP DEV-MODE] {to_email} → {code} ({purpose})")
        print(f"\n========== OTP for {to_email} ==========\n  CODE: {code}\n  PURPOSE: {purpose}\n========================================\n")
        return
    params = {"from": f"{APP_NAME} <{SENDER_EMAIL}>", "to": [to_email], "subject": f"{APP_NAME} - {title} ({code})", "html": html}
    try:
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        msg = str(e)
        # In Resend testing mode, sending is restricted to verified email — log code for dev
        if "testing emails" in msg or "verify a domain" in msg or "403" in msg:
            logging.warning(f"[OTP RESEND-RESTRICTED] {to_email} → {code} ({purpose}) — verify domain at resend.com/domains")
            print(f"\n⚠️  RESEND TEST MODE — OTP for {to_email}\n  CODE: {code}\n  PURPOSE: {purpose}\n  Verify a domain at https://resend.com/domains for production sending.\n")
            return  # do not fail registration
        logging.exception("Resend send error")
        raise HTTPException(500, f"تعذر إرسال البريد: {msg[:140]}")

app = FastAPI(title="Tamkeen API")
api = APIRouter(prefix="/api")

DEPARTMENTS = ["accounting", "computer_eng", "cs", "ai"]
DEPT_AR = {
    "accounting": "المحاسبة",
    "computer_eng": "هندسة الحاسبات",
    "cs": "علوم الحاسوب",
    "ai": "علوم الذكاء الاصطناعي",
}

# ============ Helpers ============
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_token(user_id: str, role: str) -> str:
    payload = {"sub": user_id, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(days=30),
               "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="غير مصرح")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الجلسة")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="رمز غير صالح")

def require_role(role: str):
    async def _dep(user: dict = Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="ليس لديك صلاحية")
        return user
    return _dep

# ============ Models ============
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["student", "employer", "admin"]
    # student fields
    department: Optional[str] = None
    level: Optional[int] = None
    gender: Optional[str] = None
    # employer fields
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_specialty: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class GoogleExchangeIn(BaseModel):
    session_id: str
    role: Optional[str] = "student"

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    level: Optional[int] = None
    gender: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_specialty: Optional[str] = None

class TestSubmit(BaseModel):
    department: str
    level: int
    answers: List[dict]  # [{question_id, selected}]
    duration_seconds: int

class JobCreate(BaseModel):
    title: str
    description: str
    department: str
    level_required: int
    gender_pref: Optional[str] = None  # "male"|"female"|None
    seats: int = 1
    custom_questions: Optional[List[dict]] = None  # [{q, options, correct}]
    direct_accept: bool = True

class ApplyIn(BaseModel):
    cover_letter: Optional[str] = None
    custom_answers: Optional[List[dict]] = None

class ChatIn(BaseModel):
    session_id: str
    message: str
    mode: Literal["mentor", "interview"] = "mentor"
    context: Optional[dict] = None  # {department, level, role}

# ============ Auth Endpoints ============
@api.post("/auth/register")
async def register(payload: RegisterIn):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="البريد مستخدم مسبقاً")
    user_id = f"u_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "role": payload.role,
        "department": payload.department,
        "level": payload.level,
        "gender": payload.gender,
        "company_name": payload.company_name,
        "company_address": payload.company_address,
        "company_specialty": payload.company_specialty,
        "skills": [],
        "bio": "",
        "passed_competency": False,
        "auth_provider": "email",
        "email_verified": True,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, payload.role)
    doc.pop("password_hash", None); doc.pop("_id", None)
    return {"token": token, "user": doc}

class VerifyIn(BaseModel):
    email: EmailStr
    code: str

@api.post("/auth/verify-email")
async def verify_email(payload: VerifyIn):
    email = payload.email.lower()
    rec = await db.otps.find_one({"email": email, "purpose": "verify"})
    if not rec: raise HTTPException(400, "لا يوجد رمز نشط، اطلب رمزاً جديداً")
    if rec.get("attempts", 0) >= 5: raise HTTPException(429, "محاولات كثيرة، اطلب رمزاً جديداً")
    if rec["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(400, "انتهت صلاحية الرمز")
    if rec["code"] != payload.code.strip():
        await db.otps.update_one({"_id": rec["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "رمز غير صحيح")
    await db.users.update_one({"email": email}, {"$set": {"email_verified": True}})
    await db.otps.delete_one({"_id": rec["_id"]})
    user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    token = create_token(user["user_id"], user["role"])
    return {"token": token, "user": user}

class ResendIn(BaseModel):
    email: EmailStr
    purpose: Literal["verify", "reset"] = "verify"

@api.post("/auth/resend-code")
async def resend_code(payload: ResendIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user: raise HTTPException(404, "البريد غير مسجل")
    if payload.purpose == "verify" and user.get("email_verified"):
        raise HTTPException(400, "البريد مفعّل مسبقاً")
    code = f"{random.randint(0, 999999):06d}"
    await db.otps.update_one(
        {"email": email, "purpose": payload.purpose},
        {"$set": {"email": email, "purpose": payload.purpose, "code": code,
                  "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
                  "attempts": 0, "created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    await send_otp_email(email, code, payload.purpose)
    return {"ok": True, "message": "تم إرسال الرمز"}

class ForgotIn(BaseModel):
    email: EmailStr

@api.post("/auth/forgot-password")
async def forgot_password(payload: ForgotIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        code = f"{random.randint(0, 999999):06d}"
        await db.otps.update_one(
            {"email": email, "purpose": "reset"},
            {"$set": {"email": email, "purpose": "reset", "code": code,
                      "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
                      "attempts": 0, "created_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        await send_otp_email(email, code, "reset")
    return {"ok": True, "message": "إن كان البريد مسجلاً، فقد أُرسل إليه رمز إعادة التعيين"}

class ResetIn(BaseModel):
    email: EmailStr
    code: str
    new_password: str

@api.post("/auth/reset-password")
async def reset_password(payload: ResetIn):
    if len(payload.new_password) < 6:
        raise HTTPException(400, "كلمة السر قصيرة")
    email = payload.email.lower()
    rec = await db.otps.find_one({"email": email, "purpose": "reset"})
    if not rec: raise HTTPException(400, "لا يوجد رمز نشط")
    if rec.get("attempts", 0) >= 5: raise HTTPException(429, "محاولات كثيرة")
    if rec["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(400, "انتهت صلاحية الرمز")
    if rec["code"] != payload.code.strip():
        await db.otps.update_one({"_id": rec["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "رمز غير صحيح")
    await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    await db.otps.delete_one({"_id": rec["_id"]})
    return {"ok": True, "message": "تم تحديث كلمة السر"}

@api.post("/auth/login")
async def login(payload: LoginIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بريد أو كلمة سر غير صحيحة")
    token = create_token(user["user_id"], user["role"])
    user.pop("password_hash", None); user.pop("_id", None)
    return {"token": token, "user": user}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api.post("/auth/google/exchange")
async def google_exchange(payload: GoogleExchangeIn):
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient(timeout=20) as h:
        r = await h.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="فشل التحقق من جوجل")
    data = r.json()
    email = data["email"].lower()
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = f"u_{uuid.uuid4().hex[:12]}"
        doc = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", email.split("@")[0]),
            "role": payload.role or "student",
            "picture": data.get("picture"),
            "auth_provider": "google",
            "skills": [],
            "bio": "",
            "passed_competency": False,
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(doc)
        user = doc
    token = create_token(user["user_id"], user["role"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user}

# ============ Profile ============
@api.put("/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.dict().items() if v is not None}
    if update:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update})
    fresh = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return fresh

# ============ Questions / Tests ============
@api.get("/questions")
async def get_questions(department: str, level: int, count: int = 10):
    cursor = db.questions.aggregate([
        {"$match": {"department": department, "level": level}},
        {"$sample": {"size": count}},
        {"$project": {"_id": 0, "correct": 0}},
    ])
    return await cursor.to_list(length=count)

@api.post("/tests/submit")
async def submit_test(payload: TestSubmit, user: dict = Depends(get_current_user)):
    qids = [a["question_id"] for a in payload.answers]
    qs = await db.questions.find({"id": {"$in": qids}}, {"_id": 0}).to_list(length=200)
    qmap = {q["id"]: q for q in qs}
    correct = 0
    for a in payload.answers:
        q = qmap.get(a["question_id"])
        if q and a.get("selected") == q["correct"]:
            correct += 1
    total = len(payload.answers) or 1
    score = round((correct / total) * 100)
    passed = score >= 60
    attempt = {
        "attempt_id": f"a_{uuid.uuid4().hex[:10]}",
        "user_id": user["user_id"],
        "department": payload.department,
        "level": payload.level,
        "score": score,
        "correct": correct,
        "total": total,
        "duration_seconds": payload.duration_seconds,
        "passed": passed,
        "created_at": datetime.now(timezone.utc),
    }
    await db.test_attempts.insert_one(attempt)
    if passed:
        # update skills matrix and unlock jobs
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"passed_competency": True, "last_score": score}},
        )
        await db.notifications.insert_one({
            "id": f"n_{uuid.uuid4().hex[:10]}",
            "user_id": user["user_id"],
            "title": "تهانينا! اجتزت الاختبار",
            "body": f"حصلت على {score}% — تم فتح بوابة الشركات لك.",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })
    else:
        await db.notifications.insert_one({
            "id": f"n_{uuid.uuid4().hex[:10]}",
            "user_id": user["user_id"],
            "title": "تم تحويلك إلى أكاديمية تمكين",
            "body": f"حصلت على {score}%. أكمل الدورات ثم أعد المحاولة.",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })
    attempt.pop("_id", None)
    return attempt

# ============ Jobs ============
@api.post("/jobs")
async def create_job(payload: JobCreate, user: dict = Depends(require_role("employer"))):
    job_id = f"j_{uuid.uuid4().hex[:10]}"
    doc = {
        "job_id": job_id,
        "employer_id": user["user_id"],
        "company_name": user.get("company_name") or user.get("name"),
        "title": payload.title,
        "description": payload.description,
        "department": payload.department,
        "level_required": payload.level_required,
        "gender_pref": payload.gender_pref,
        "seats": payload.seats,
        "custom_questions": payload.custom_questions or [],
        "direct_accept": payload.direct_accept,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    }
    await db.jobs.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api.get("/jobs")
async def list_jobs(user: dict = Depends(get_current_user)):
    if user["role"] == "employer":
        cur = db.jobs.find({"employer_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
        return await cur.to_list(length=200)
    # student: must have passed competency
    if not user.get("passed_competency"):
        return []
    q = {"active": True, "department": user.get("department"), "level_required": {"$lte": user.get("level") or 99}}
    if user.get("gender"):
        q["$or"] = [{"gender_pref": None}, {"gender_pref": user["gender"]}]
    cur = db.jobs.find(q, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(length=200)

@api.get("/jobs/{job_id}")
async def get_job(job_id: str, user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="غير موجود")
    return job

@api.post("/jobs/{job_id}/apply")
async def apply_job(job_id: str, payload: ApplyIn, user: dict = Depends(require_role("student"))):
    if not user.get("passed_competency"):
        raise HTTPException(status_code=403, detail="عليك اجتياز اختبار الكفاءة أولاً")
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="الوظيفة غير موجودة")
    existing = await db.applications.find_one({"job_id": job_id, "student_id": user["user_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="لقد تقدمت سابقاً")
    # score custom answers
    cscore = None
    if job.get("custom_questions") and payload.custom_answers:
        correct = sum(
            1 for a in payload.custom_answers
            for q in job["custom_questions"]
            if q.get("id") == a.get("id") and q.get("correct") == a.get("selected")
        )
        cscore = round((correct / max(1, len(job["custom_questions"]))) * 100)
    app_id = f"ap_{uuid.uuid4().hex[:10]}"
    doc = {
        "application_id": app_id,
        "job_id": job_id,
        "student_id": user["user_id"],
        "student_name": user["name"],
        "student_score": user.get("last_score", 0),
        "custom_score": cscore,
        "cover_letter": payload.cover_letter,
        "status": "accepted" if job.get("direct_accept") else "pending",
        "created_at": datetime.now(timezone.utc),
    }
    await db.applications.insert_one(doc)
    # notify employer
    await db.notifications.insert_one({
        "id": f"n_{uuid.uuid4().hex[:10]}",
        "user_id": job["employer_id"],
        "title": "متقدم جديد",
        "body": f"{user['name']} تقدم لوظيفة {job['title']}",
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })
    if doc["status"] == "accepted":
        await db.notifications.insert_one({
            "id": f"n_{uuid.uuid4().hex[:10]}",
            "user_id": user["user_id"],
            "title": "تم قبولك! ",
            "body": f"تم قبولك مبدئياً في {job['title']} لدى {job['company_name']}.",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        })
    doc.pop("_id", None)
    return doc

@api.get("/jobs/{job_id}/applicants")
async def list_applicants(job_id: str, user: dict = Depends(require_role("employer"))):
    job = await db.jobs.find_one({"job_id": job_id})
    if not job or job["employer_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="غير مصرح")
    cur = db.applications.find({"job_id": job_id}, {"_id": 0}).sort("student_score", -1)
    return await cur.to_list(length=500)

@api.get("/applications/mine")
async def my_applications(user: dict = Depends(require_role("student"))):
    cur = db.applications.find({"student_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(length=200)

# ============ Academy ============
@api.get("/courses")
async def list_courses(department: Optional[str] = None, level: Optional[int] = None):
    q: dict = {}
    if department: q["department"] = department
    if level is not None:
        q["$or"] = [{"level": {"$lte": level}}, {"level": {"$exists": False}}]
    cur = db.courses.find(q, {"_id": 0}).sort([("level",1),("order",1)])
    return await cur.to_list(length=200)

@api.get("/courses/{course_id}")
async def get_course(course_id: str):
    c = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not c:
        raise HTTPException(404, "غير موجود")
    return c

# ============ AI Chat ============
@api.post("/ai/chat")
async def ai_chat(payload: ChatIn, user: dict = Depends(get_current_user)):
    if payload.mode == "interview":
        sys_msg = (
            "أنت مدرب مقابلات وظيفية محترف يجري مقابلة باللغة العربية. "
            f"تخصص المرشح: {DEPT_AR.get(payload.context.get('department','') if payload.context else '', 'عام')}. "
            "اطرح سؤالاً واحداً في كل مرة، وقيّم الإجابات بشكل بناء، واستمر في المقابلة بأسلوب احترافي ومشجع."
        )
    else:
        sys_msg = (
            "أنت 'مرشد تمكين'، مساعد دراسي ذكي يساعد الطلاب العرب في تخصصات الحاسوب والمحاسبة والذكاء الاصطناعي. "
            "أجب باللغة العربية بأسلوب ودود وواضح، مع أمثلة عملية مختصرة عند الحاجة."
        )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=payload.session_id,
        system_message=sys_msg,
    ).with_model("gemini", GEMINI_MODEL)
    # restore history
    history = await db.chat_messages.find(
        {"session_id": payload.session_id, "user_id": user["user_id"]},
        {"_id": 0},
    ).sort("created_at", 1).to_list(length=50)
    # store user msg
    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "user_id": user["user_id"],
        "role": "user",
        "content": payload.message,
        "mode": payload.mode,
        "created_at": datetime.now(timezone.utc),
    })
    try:
        reply = await chat.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logging.exception("AI chat error")
        raise HTTPException(500, f"خطأ في المساعد الذكي: {str(e)[:120]}")
    await db.chat_messages.insert_one({
        "session_id": payload.session_id,
        "user_id": user["user_id"],
        "role": "assistant",
        "content": reply,
        "mode": payload.mode,
        "created_at": datetime.now(timezone.utc),
    })
    return {"reply": reply}

@api.get("/ai/history")
async def ai_history(session_id: str, user: dict = Depends(get_current_user)):
    cur = db.chat_messages.find(
        {"session_id": session_id, "user_id": user["user_id"]},
        {"_id": 0},
    ).sort("created_at", 1)
    return await cur.to_list(length=200)

# ============ Notifications ============
@api.get("/notifications")
async def get_notifs(user: dict = Depends(get_current_user)):
    cur = db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(length=100)

@api.post("/notifications/{nid}/read")
async def mark_read(nid: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}

# ============ Admin ============
class QuestionIn(BaseModel):
    department: str
    level: int
    q: str
    options: List[str]
    correct: int

class CourseIn(BaseModel):
    department: str
    level: int = 1
    title: str
    summary: str
    duration_min: int = 20
    external_url: Optional[str] = None
    provider: Optional[str] = None
    lessons: List[dict] = []

class TicketIn(BaseModel):
    subject: str
    message: str

class TicketReply(BaseModel):
    message: str

@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("admin"))):
    return {
        "users": await db.users.count_documents({}),
        "students": await db.users.count_documents({"role":"student"}),
        "employers": await db.users.count_documents({"role":"employer"}),
        "jobs": await db.jobs.count_documents({}),
        "applications": await db.applications.count_documents({}),
        "questions": await db.questions.count_documents({}),
        "courses": await db.courses.count_documents({}),
        "open_tickets": await db.tickets.count_documents({"status":"open"}),
    }

@api.get("/admin/users")
async def admin_users(user: dict = Depends(require_role("admin"))):
    cur = db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1)
    return await cur.to_list(length=500)

@api.get("/admin/questions")
async def admin_questions(user: dict = Depends(require_role("admin"))):
    cur = db.questions.find({}, {"_id": 0}).sort("department", 1)
    return await cur.to_list(length=1000)

@api.post("/admin/questions")
async def admin_add_q(payload: QuestionIn, user: dict = Depends(require_role("admin"))):
    doc = {"id": f"q_{uuid.uuid4().hex[:10]}", **payload.dict()}
    await db.questions.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/questions/{qid}")
async def admin_edit_q(qid: str, payload: QuestionIn, user: dict = Depends(require_role("admin"))):
    upd = payload.dict()
    r = await db.questions.update_one({"id": qid}, {"$set": upd})
    if r.matched_count == 0: raise HTTPException(404, "غير موجود")
    return {"ok": True}

@api.delete("/admin/questions/{qid}")
async def admin_del_q(qid: str, user: dict = Depends(require_role("admin"))):
    await db.questions.delete_one({"id": qid}); return {"ok": True}

@api.post("/admin/courses")
async def admin_add_course(payload: CourseIn, user: dict = Depends(require_role("admin"))):
    doc = {"course_id": f"c_{uuid.uuid4().hex[:10]}", "order": 99, "created_at": datetime.now(timezone.utc), **payload.dict()}
    await db.courses.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/courses/{cid}")
async def admin_edit_course(cid: str, payload: CourseIn, user: dict = Depends(require_role("admin"))):
    upd = payload.dict()
    r = await db.courses.update_one({"course_id": cid}, {"$set": upd})
    if r.matched_count == 0: raise HTTPException(404, "غير موجود")
    return {"ok": True}

@api.delete("/admin/courses/{cid}")
async def admin_del_course(cid: str, user: dict = Depends(require_role("admin"))):
    await db.courses.delete_one({"course_id": cid}); return {"ok": True}

# ============ Tickets (Employer ↔ Admin) ============
@api.post("/tickets")
async def create_ticket(payload: TicketIn, user: dict = Depends(get_current_user)):
    if user["role"] not in ("employer", "student"):
        raise HTTPException(403, "غير مصرح")
    tid = f"t_{uuid.uuid4().hex[:10]}"
    doc = {
        "ticket_id": tid,
        "user_id": user["user_id"],
        "user_name": user.get("company_name") or user.get("name"),
        "user_role": user["role"],
        "subject": payload.subject,
        "status": "open",
        "messages": [{"from": user["role"], "name": user["name"], "text": payload.message, "at": datetime.now(timezone.utc).isoformat()}],
        "created_at": datetime.now(timezone.utc),
    }
    await db.tickets.insert_one(doc)
    # notify all admins
    admins = await db.users.find({"role":"admin"}, {"_id":0, "user_id":1}).to_list(length=10)
    for a in admins:
        await db.notifications.insert_one({
            "id": f"n_{uuid.uuid4().hex[:10]}", "user_id": a["user_id"],
            "title": "تذكرة دعم جديدة", "body": payload.subject,
            "read": False, "created_at": datetime.now(timezone.utc),
        })
    doc.pop("_id", None); return doc

@api.get("/tickets")
async def list_tickets(user: dict = Depends(get_current_user)):
    q = {} if user["role"] == "admin" else {"user_id": user["user_id"]}
    cur = db.tickets.find(q, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(length=200)

@api.post("/tickets/{tid}/reply")
async def reply_ticket(tid: str, payload: TicketReply, user: dict = Depends(get_current_user)):
    t = await db.tickets.find_one({"ticket_id": tid})
    if not t: raise HTTPException(404, "غير موجود")
    if user["role"] != "admin" and t["user_id"] != user["user_id"]:
        raise HTTPException(403, "غير مصرح")
    msg = {"from": user["role"], "name": user["name"], "text": payload.message, "at": datetime.now(timezone.utc).isoformat()}
    await db.tickets.update_one({"ticket_id": tid}, {"$push": {"messages": msg}, "$set": {"status": "open"}})
    # notify other party
    target = t["user_id"] if user["role"] == "admin" else None
    if target:
        await db.notifications.insert_one({
            "id": f"n_{uuid.uuid4().hex[:10]}", "user_id": target,
            "title": "رد جديد على تذكرتك", "body": payload.message[:80],
            "read": False, "created_at": datetime.now(timezone.utc),
        })
    return {"ok": True}

@api.post("/tickets/{tid}/close")
async def close_ticket(tid: str, user: dict = Depends(require_role("admin"))):
    await db.tickets.update_one({"ticket_id": tid}, {"$set": {"status": "closed"}})
    return {"ok": True}

# ============ Health ============
@api.get("/")
async def root():
    return {"app": "Tamkeen API", "status": "ok"}

# ============ Seed ============
SEED_QUESTIONS = {
    "cs": [
        {"q": "ما هي بنية البيانات الأنسب للوصول السريع بالمفتاح؟", "options": ["مصفوفة","قائمة مرتبطة","جدول هاش","شجرة"], "correct": 2, "level": 1},
        {"q": "ما الفرق بين Stack و Queue؟", "options": ["كلاهما FIFO","Stack: LIFO، Queue: FIFO","Stack: FIFO، Queue: LIFO","لا فرق"], "correct": 1, "level": 1},
        {"q": "ما تعقيد البحث الثنائي؟", "options": ["O(n)","O(log n)","O(n log n)","O(1)"], "correct": 1, "level": 2},
        {"q": "ما هي SQL Injection؟", "options": ["نوع قاعدة بيانات","ثغرة أمنية","لغة برمجة","خوارزمية فرز"], "correct": 1, "level": 2},
        {"q": "ما الفرق بين عملية ومسار (process vs thread)؟", "options": ["لا فرق","العملية مساحة منفصلة، المسار يشاركها","المسار أبطأ دائماً","العملية للتشبيك فقط"], "correct": 1, "level": 3},
        {"q": "ما خوارزمية Dijkstra؟", "options": ["فرز","أقصر مسار","ضغط","تشفير"], "correct": 1, "level": 3},
        {"q": "ما هو REST API؟", "options": ["قاعدة بيانات","نمط معماري للويب","لغة برمجة","نظام تشغيل"], "correct": 1, "level": 1},
        {"q": "ما هو Big-O لخوارزمية الفرز السريع في الحالة المتوسطة؟", "options": ["O(n²)","O(n log n)","O(n)","O(log n)"], "correct": 1, "level": 3},
    ],
    "ai": [
        {"q": "ما الفرق بين التعلم المُشرف وغير المُشرف؟", "options": ["لا فرق","المُشرف يستخدم بيانات موسومة","غير المُشرف أسرع","كلاهما يحتاج تسميات"], "correct": 1, "level": 1},
        {"q": "ما وظيفة دالة التنشيط ReLU؟", "options": ["max(0,x)","sin(x)","تحويل خطي","تطبيع"], "correct": 0, "level": 2},
        {"q": "ما هو Overfitting؟", "options": ["تعميم جيد","حفظ بيانات التدريب","نقص بيانات","نوع شبكة"], "correct": 1, "level": 2},
        {"q": "ما هو Transformer؟", "options": ["محول كهربائي","معمارية شبكة عصبية","قاعدة بيانات","لغة"], "correct": 1, "level": 3},
        {"q": "ما المقصود بـ Gradient Descent؟", "options": ["خوارزمية تحسين","نوع شبكة","دالة خطأ","قاعدة بيانات"], "correct": 0, "level": 2},
        {"q": "ما هو RAG؟", "options": ["نوع GPU","Retrieval Augmented Generation","لغة برمجة","مكتبة"], "correct": 1, "level": 3},
        {"q": "ما هي المتجهات في التعلم الآلي؟", "options": ["تمثيل عددي للبيانات","نوع مصفوفة فقط","ألوان","لا شيء"], "correct": 0, "level": 1},
        {"q": "ما الفرق بين CNN و RNN؟", "options": ["لا فرق","CNN للصور، RNN للتسلسل","RNN أسرع","CNN للنصوص"], "correct": 1, "level": 3},
    ],
    "computer_eng": [
        {"q": "ما عدد البتات في البايت؟", "options": ["4","8","16","32"], "correct": 1, "level": 1},
        {"q": "ما الفرق بين RAM و ROM؟", "options": ["لا فرق","RAM متطايرة، ROM ثابتة","ROM أسرع","RAM أصغر"], "correct": 1, "level": 1},
        {"q": "ما وظيفة وحدة ALU؟", "options": ["تخزين","عمليات حسابية ومنطقية","شبكات","عرض"], "correct": 1, "level": 2},
        {"q": "ما هو Pipelining؟", "options": ["نوع كابل","تنفيذ تعليمات بالتوازي","ذاكرة","نظام تشغيل"], "correct": 1, "level": 3},
        {"q": "ما الفرق بين TCP و UDP؟", "options": ["لا فرق","TCP موثوق، UDP أسرع وغير موثوق","UDP موثوق فقط","TCP للبث"], "correct": 1, "level": 2},
        {"q": "ما هو Cache Memory؟", "options": ["ذاكرة بطيئة","ذاكرة سريعة قريبة من المعالج","قرص صلب","شبكة"], "correct": 1, "level": 2},
        {"q": "ما المقصود بـ FPGA؟", "options": ["معالج رسومي","مصفوفة بوابات قابلة للبرمجة","ذاكرة","شاشة"], "correct": 1, "level": 3},
        {"q": "ما طبقة OSI الخاصة بـ IP؟", "options": ["Data Link","Network","Transport","Session"], "correct": 1, "level": 2},
    ],
    "accounting": [
        {"q": "المعادلة المحاسبية الأساسية؟", "options": ["الأصول = الخصوم + حقوق الملكية","الإيراد = المصاريف","الأصول = الإيراد","لا شيء"], "correct": 0, "level": 1},
        {"q": "ما هو دفتر الأستاذ؟", "options": ["دفتر يومي","تسجيل تفصيلي للحسابات","ميزان المراجعة","دفتر مبيعات"], "correct": 1, "level": 1},
        {"q": "ما الفرق بين الأصول الثابتة والمتداولة؟", "options": ["لا فرق","الثابتة طويلة الأجل","المتداولة طويلة الأجل","الثابتة سيولة"], "correct": 1, "level": 2},
        {"q": "ما هي قائمة الدخل؟", "options": ["قائمة الإيرادات والمصاريف","قائمة الميزانية","قائمة التدفقات","قائمة الملاك"], "correct": 0, "level": 2},
        {"q": "ما المقصود بالاستهلاك؟", "options": ["شراء","توزيع تكلفة الأصل على عمره","بيع","إيراد"], "correct": 1, "level": 2},
        {"q": "ما هو IFRS؟", "options": ["نظام ضريبي","معايير دولية لإعداد التقارير المالية","برنامج محاسبي","بنك"], "correct": 1, "level": 3},
        {"q": "ما الفرق بين القيمة الدفترية والسوقية؟", "options": ["لا فرق","الدفترية بالسجلات، السوقية في السوق","العكس","الدفترية أعلى دائماً"], "correct": 1, "level": 3},
        {"q": "ما هو ميزان المراجعة؟", "options": ["قائمة لمطابقة المدين والدائن","قائمة دخل","ميزانية","تدفق نقدي"], "correct": 0, "level": 1},
    ],
}

SEED_COURSES = [
    {"course_id": "c_cs_101", "department": "cs", "level": 1, "title": "أساسيات هياكل البيانات", "summary": "مقدمة سريعة لأهم هياكل البيانات.", "duration_min": 25, "order": 1,
     "lessons": [
        {"id":"l1","title":"المصفوفات والقوائم","content":"المصفوفات تخزن عناصر متجاورة بحجم ثابت...","video_minutes":6},
        {"id":"l2","title":"الجداول والـ Hash","content":"جداول الهاش توفر وصول O(1) في المتوسط...","video_minutes":7},
        {"id":"l3","title":"الأشجار والرسوم","content":"الأشجار الثنائية وتطبيقاتها...","video_minutes":8},
     ]},
    {"course_id":"c_ai_101","department":"ai","level":1,"title":"أساسيات تعلم الآلة","summary":"مفاهيم أولية في الذكاء الاصطناعي.","duration_min":30,"order":1,
     "lessons":[
        {"id":"l1","title":"التعلم المُشرف","content":"النماذج تتعلم من بيانات موسومة لتنبؤ القيم...","video_minutes":7},
        {"id":"l2","title":"الشبكات العصبية","content":"العصبونات والأوزان ودوال التنشيط...","video_minutes":9},
        {"id":"l3","title":"تقييم النماذج","content":"الدقة والاسترجاع والمصفوفة...","video_minutes":6},
     ]},
    {"course_id":"c_acc_101","department":"accounting","level":1,"title":"أساسيات المحاسبة","summary":"المعادلة المحاسبية والقوائم.","duration_min":20,"order":1,
     "lessons":[
        {"id":"l1","title":"المعادلة المحاسبية","content":"الأصول = الخصوم + حقوق الملكية...","video_minutes":5},
        {"id":"l2","title":"دفتر اليومية والأستاذ","content":"كيفية تسجيل القيود...","video_minutes":7},
        {"id":"l3","title":"القوائم المالية","content":"الدخل والميزانية والتدفقات...","video_minutes":6},
     ]},
    {"course_id":"c_ce_101","department":"computer_eng","title":"معمارية الحاسوب","summary":"مكونات الحاسب وعملها.","duration_min":25,"order":1,
     "lessons":[
        {"id":"l1","title":"وحدة المعالجة","content":"ALU ووحدة التحكم والمسجلات...","video_minutes":6},
        {"id":"l2","title":"الذاكرة","content":"RAM/ROM/Cache وفرقها...","video_minutes":6},
        {"id":"l3","title":"الشبكات","content":"طبقات OSI وTCP/UDP...","video_minutes":7},
     ]},
]

@app.on_event("startup")
async def on_start():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.questions.create_index([("department",1),("level",1)])
    await db.jobs.create_index("employer_id")
    await db.applications.create_index([("job_id",1),("student_id",1)])
    await db.chat_messages.create_index([("session_id",1),("user_id",1)])
    await db.notifications.create_index([("user_id",1),("created_at",-1)])
    await db.otps.create_index([("email",1),("purpose",1)], unique=True)

    # seed questions
    if await db.questions.count_documents({}) == 0:
        docs = []
        for dept, qs in SEED_QUESTIONS.items():
            for q in qs:
                docs.append({
                    "id": f"q_{uuid.uuid4().hex[:10]}",
                    "department": dept,
                    "level": q["level"],
                    "q": q["q"],
                    "options": q["options"],
                    "correct": q["correct"],
                })
        if docs:
            await db.questions.insert_many(docs)

    # seed courses
    if await db.courses.count_documents({}) == 0:
        await db.courses.insert_many([{**c, "created_at": datetime.now(timezone.utc)} for c in SEED_COURSES])

    # seed demo users
    demos = [
        {"email":"student@tamkeen.com","password":"Student123!","name":"سارة الطالبة","role":"student","department":"cs","level":3,"gender":"female"},
        {"email":"employer@tamkeen.com","password":"Employer123!","name":"أحمد المدير","role":"employer","company_name":"شركة تمكين التقنية","company_address":"الرياض","company_specialty":"تقنية معلومات"},
        {"email":"abaskar078@gmail.com","password":"abbas2006","name":"مدير المنصة","role":"admin"},
    ]
    for d in demos:
        existing = await db.users.find_one({"email": d["email"]})
        if existing:
            # ensure role is up to date for admin
            if d.get("role") == "admin" and existing.get("role") != "admin":
                await db.users.update_one({"email": d["email"]}, {"$set": {"role": "admin", "password_hash": hash_password(d["password"]) }})
            continue
        if True:
            await db.users.insert_one({
                "user_id": f"u_{uuid.uuid4().hex[:12]}",
                "email": d["email"],
                "password_hash": hash_password(d["password"]),
                "name": d["name"],
                "role": d["role"],
                "department": d.get("department"),
                "level": d.get("level"),
                "gender": d.get("gender"),
                "company_name": d.get("company_name"),
                "company_address": d.get("company_address"),
                "company_specialty": d.get("company_specialty"),
                "skills": [],
                "bio": "",
                "passed_competency": False,
                "auth_provider": "email",
                "email_verified": True,
                "created_at": datetime.now(timezone.utc),
            })

    # seed sample job
    employer = await db.users.find_one({"email":"employer@tamkeen.com"})
    if employer and await db.jobs.count_documents({"employer_id": employer["user_id"]}) == 0:
        await db.jobs.insert_one({
            "job_id": f"j_{uuid.uuid4().hex[:10]}",
            "employer_id": employer["user_id"],
            "company_name": employer["company_name"],
            "title": "مطور تطبيقات (متدرب)",
            "description": "ابحث عن طلاب علوم حاسوب موهوبين للتدريب الصيفي على بناء تطبيقات الموبايل.",
            "department": "cs",
            "level_required": 2,
            "gender_pref": None,
            "seats": 3,
            "custom_questions": [],
            "direct_accept": True,
            "active": True,
            "created_at": datetime.now(timezone.utc),
        })

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
# في نهاية ملف server.py
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)