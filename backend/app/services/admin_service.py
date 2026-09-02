from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.exceptions.exceptions import UserNotFoundError
from app.models.study_record import StudyRecord
from app.models.user import User
from app.repositories import study_record_repository, user_repository


def list_users(db: Session) -> list[User]:
    return user_repository.list_all(db)


def get_user_or_404(db: Session, user_id: int) -> User:
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise UserNotFoundError("指定されたユーザーが見つかりません")
    return user


def list_user_study_records(
    db: Session,
    *,
    user_id: int,
    keyword: str | None,
    category_id: int | None,
    understanding_level: int | None,
    date_from: date | None,
    date_to: date | None,
    page: int,
    page_size: int,
) -> tuple[list[StudyRecord], int]:
    get_user_or_404(db, user_id)
    return study_record_repository.search(
        db,
        user_id=user_id,
        keyword=keyword,
        category_id=category_id,
        understanding_level=understanding_level,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
