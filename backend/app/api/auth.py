from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, verify_csrf_token
from app.core.security import create_access_token, generate_csrf_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_auth_cookies(response: Response, *, user_id: int, role: str) -> None:
    access_token = create_access_token(user_id=user_id, role=role)
    csrf_token = generate_csrf_token()

    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )
    response.set_cookie(
        key=settings.csrf_token_cookie_name,
        value=csrf_token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.access_token_cookie_name)
    response.delete_cookie(settings.csrf_token_cookie_name)


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
    return auth_service.register_user(db, username=payload.username, password=payload.password)


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> User:
    user = auth_service.authenticate(db, username=payload.username, password=payload.password)
    _set_auth_cookies(response, user_id=user.id, role=user.role)
    return user


@router.post(
    "/logout",
    status_code=204,
    dependencies=[Depends(verify_csrf_token)],
)
def logout(response: Response, current_user: User = Depends(get_current_user)):
    _clear_auth_cookies(response)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
