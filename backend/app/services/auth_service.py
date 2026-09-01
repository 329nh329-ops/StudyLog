from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.exceptions.exceptions import InvalidCredentialsError, UsernameAlreadyExistsError
from app.models.user import User
from app.repositories import user_repository


def register_user(db: Session, *, username: str, password: str) -> User:
    if user_repository.get_by_username(db, username) is not None:
        raise UsernameAlreadyExistsError("このユーザー名は既に使用されています。")
    password_hash = hash_password(password)
    return user_repository.create(db, username=username, password_hash=password_hash, role="USER")


def authenticate(db: Session, *, username: str, password: str) -> User:
    user = user_repository.get_by_username(db, username)
    if user is None or not verify_password(password, user.password_hash):
        raise InvalidCredentialsError("ユーザー名またはパスワードが正しくありません。")
    return user
