from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.exceptions.exceptions import (
    CategoryNotFoundError,
    StudyRecordForbiddenError,
    StudyRecordNotFoundError,
)
from app.models.study_record import StudyRecord
from app.repositories import category_repository, study_record_repository


def _get_record_or_404(db: Session, record_id: int) -> StudyRecord:
    record = study_record_repository.get_by_id(db, record_id)
    if record is None:
        raise StudyRecordNotFoundError("学習記録が見つかりません")
    return record


def _ensure_owner(record: StudyRecord, user_id: int) -> None:
    if record.user_id != user_id:
        raise StudyRecordForbiddenError("この学習記録を操作する権限がありません")


def get_study_record(db: Session, *, record_id: int, user_id: int) -> StudyRecord:
    record = _get_record_or_404(db, record_id)
    _ensure_owner(record, user_id)
    return record


def list_study_records(
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


def create_study_record(db: Session, *, user_id: int, fields: dict) -> StudyRecord:
    category = category_repository.get_active_by_id(db, fields["category_id"])
    if category is None:
        raise CategoryNotFoundError("指定されたカテゴリが見つかりません")

    return study_record_repository.create(db, user_id=user_id, **fields)


def update_study_record(db: Session, *, record_id: int, user_id: int, fields: dict) -> StudyRecord:
    record = _get_record_or_404(db, record_id)
    _ensure_owner(record, user_id)

    new_category_id = fields["category_id"]
    if new_category_id != record.category_id:
        category = category_repository.get_active_by_id(db, new_category_id)
        if category is None:
            raise CategoryNotFoundError("指定されたカテゴリが見つかりません")

    return study_record_repository.update(db, record, **fields)


def delete_study_record(db: Session, *, record_id: int, user_id: int) -> None:
    record = _get_record_or_404(db, record_id)
    _ensure_owner(record, user_id)
    study_record_repository.soft_delete(db, record)
