from __future__ import annotations

from datetime import date

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.category import Category
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


def get_total_minutes_for_date(db: Session, *, user_id: int, target_date: date) -> int:
    total = (
        db.query(func.coalesce(func.sum(StudyRecord.study_minutes), 0))
        .filter(
            StudyRecord.user_id == user_id,
            StudyRecord.is_deleted.is_(False),
            StudyRecord.study_date == target_date,
        )
        .scalar()
    )
    return int(total)


def get_study_dates(db: Session, *, user_id: int) -> set[date]:
    rows = (
        db.query(StudyRecord.study_date)
        .filter(StudyRecord.user_id == user_id, StudyRecord.is_deleted.is_(False))
        .distinct()
        .all()
    )
    return {row[0] for row in rows}


def get_daily_totals(
    db: Session, *, user_id: int, date_from: date, date_to: date
) -> dict[date, int]:
    rows = (
        db.query(StudyRecord.study_date, func.sum(StudyRecord.study_minutes))
        .filter(
            StudyRecord.user_id == user_id,
            StudyRecord.is_deleted.is_(False),
            StudyRecord.study_date >= date_from,
            StudyRecord.study_date <= date_to,
        )
        .group_by(StudyRecord.study_date)
        .all()
    )
    return {row[0]: int(row[1]) for row in rows}


def get_category_totals(
    db: Session, *, user_id: int, date_from: date, date_to: date
) -> list[tuple[int, str, int]]:
    rows = (
        db.query(StudyRecord.category_id, Category.name, func.sum(StudyRecord.study_minutes))
        .join(Category, Category.id == StudyRecord.category_id)
        .filter(
            StudyRecord.user_id == user_id,
            StudyRecord.is_deleted.is_(False),
            StudyRecord.study_date >= date_from,
            StudyRecord.study_date <= date_to,
        )
        .group_by(StudyRecord.category_id, Category.name)
        .all()
    )
    return [(row[0], row[1], int(row[2])) for row in rows]


def get_monthly_totals(
    db: Session, *, user_id: int, date_from: date, date_to: date
) -> dict[str, int]:
    month_expr = func.date_format(StudyRecord.study_date, "%Y-%m")
    rows = (
        db.query(month_expr, func.sum(StudyRecord.study_minutes))
        .filter(
            StudyRecord.user_id == user_id,
            StudyRecord.is_deleted.is_(False),
            StudyRecord.study_date >= date_from,
            StudyRecord.study_date <= date_to,
        )
        .group_by(month_expr)
        .all()
    )
    return {row[0]: int(row[1]) for row in rows}


def get_recent_records(db: Session, *, user_id: int, limit: int) -> list[StudyRecord]:
    return (
        db.query(StudyRecord)
        .filter(StudyRecord.user_id == user_id, StudyRecord.is_deleted.is_(False))
        .order_by(StudyRecord.study_date.desc(), StudyRecord.created_at.desc())
        .limit(limit)
        .all()
    )
