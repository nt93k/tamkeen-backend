"""
اعتمادات FastAPI — التحقق من هوية المستخدم عبر JWT
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.services.auth_service import decode_access_token, get_user_by_id


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """استخراج المستخدم الحالي من JWT في الكوكي"""
    token = request.cookies.get("access_token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="يرجى تسجيل الدخول أولاً",
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise credentials_exception

    return user


def get_current_student(current_user: User = Depends(get_current_user)) -> User:
    """التأكد من أن المستخدم الحالي طالب"""
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="هذه الصفحة للطلاب فقط",
        )
    return current_user


def get_current_company(current_user: User = Depends(get_current_user)) -> User:
    """التأكد من أن المستخدم الحالي شركة"""
    if current_user.role != UserRole.company:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="هذه الصفحة للشركات فقط",
        )
    return current_user


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    """استخراج المستخدم الحالي بدون إجبار — يعيد None إذا لم يكن مسجلاً"""
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None
