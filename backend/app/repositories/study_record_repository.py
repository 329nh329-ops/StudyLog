from __future__ import annotations

from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.study_record import StudyRecord


def get_by_id(db: Session, record_id: int) -> StudyRecord | None:
    return (
        db.query(StudyRecord)
        .filter(StudyRecord.id == record_id, StudyRecord.is_deleted.is_(False))
        .first()
    )


def search(
    db: Session,
    *,
    user_id: int,
    keyword: str | None = None,
    category_id: int | None = None,
    understanding_level: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int,
    page_size: int,
) -> tuple[list[StudyRecord], int]:
    query = db.query(StudyRecord).filter(
        StudyRecord.user_id == user_id,
        StudyRecord.is_deleted.is_(False),
    )

    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(
            or_(StudyRecord.title.like(pattern), StudyRecord.content.like(pattern))
        )
    if category_id is not None:
        query = query.filter(StudyRecord.category_id == category_id)
    if understanding_level is not None:
        query = query.filter(StudyRecord.understanding_level == understanding_level)
    if date_from is not None:
        query = query.filter(StudyRecord.study_date >= date_from)
    if date_to is not None:
        query = query.filter(StudyRecord.study_date <= date_to)

    total = query.count()
    items = (
        query.order_by(StudyRecord.study_date.desc(), StudyRecord.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def create(db: Session, *, user_id: int, **fields) -> StudyRecord:
    record = StudyRecord(user_id=user_id, **fields)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update(db: Session, record: StudyRecord, **fields) -> StudyRecord:
    for key, value in fields.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


def soft_delete(db: Session, record: StudyRecord) -> None:
    record.is_deleted = True
    db.commit()
