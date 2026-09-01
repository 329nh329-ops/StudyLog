from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.category import Category


def get_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()


def get_active_by_id(db: Session, category_id: int) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.is_deleted.is_(False))
        .first()
    )
