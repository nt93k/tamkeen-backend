"""
نقطة دخول التطبيق - تحديث التوافق مع Python 3.14
"""
import traceback
from fastapi import FastAPI, Request, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
#from app.routers import auth, student, company, ai_tutor
from app.config import settings
from app.database import create_tables
from app.routers import auth, student, company, ai_tutor
from app.routers.deps import get_optional_user

app = FastAPI(
    title=settings.APP_NAME,
    description="منصة تمكين - ربط الطلاب بالشركات بذكاء اصطناعي",
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(company.router)
app.include_router(ai_tutor.router)

@app.on_event("startup")
async def startup_event():
    try:
        create_tables()
    except Exception as e:
        print(f"Startup Error: {e}")

# معالج الأخطاء العام للتشخيص
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_details = traceback.format_exc()
    print(f"ERROR: {error_details}")
    return HTMLResponse(
        content=f"<html><body dir='rtl'><h1>خطأ في النظام</h1><pre>{error_details}</pre></body></html>",
        status_code=500
    )

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, current_user=Depends(get_optional_user)):
    # استخدام الأسلوب الجديد المتوافق مع النسخ الحديثة
    return templates.TemplateResponse(
        request=request, 
        name="home.html", 
        context={"current_user": current_user}
    )

@app.exception_handler(404)
async def not_found(request: Request, exc):
    return templates.TemplateResponse(
        request=request, 
        name="errors/404.html", 
        status_code=404
    )

@app.exception_handler(403)
async def forbidden(request: Request, exc):
    return RedirectResponse(url="/auth/login")
