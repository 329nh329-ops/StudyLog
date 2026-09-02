from __future__ import annotations

from sqlalchemy.orm import Session

from app.exceptions.exceptions import UserNotFoundError
from app.models.user import User
from app.repositories import user_repository


def list_users(db: Session) -> list[User]:
    return user_repository.list_all(db)


def get_user_or_404(db: Session, user_id: int) -> User:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError("指定されたユーザーが見つかりません")
    return user
