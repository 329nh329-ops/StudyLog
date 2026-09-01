from __future__ import annotations

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.database import get_db
from app.exceptions.exceptions import (
    AdminRequiredError,
    AuthenticationRequiredError,
    CsrfTokenInvalidError,
)
from app.models.user import User
from app.repositories import user_repository


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(settings.access_token_cookie_name)
    if token is None:
        raise AuthenticationRequiredError("認証が必要です")

    payload = decode_access_token(token)
    user_id = int(payload["sub"])
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise AuthenticationRequiredError("認証が必要です")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise AdminRequiredError("管理者権限が必要です")
    return current_user


def verify_csrf_token(request: Request) -> None:
    cookie_token = request.cookies.get(settings.csrf_token_cookie_name)
    header_token = request.headers.get(settings.csrf_token_header_name)
    if not cookie_token or not header_token or cookie_token != header_token:
        raise CsrfTokenInvalidError("CSRFトークンが無効です")
