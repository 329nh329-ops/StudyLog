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


def get_active_by_name(db: Session, name: str) -> Category | None:
    return db.query(Category).filter(Category.name == name, Category.is_deleted.is_(False)).first()


def list_active(db: Session) -> list[Category]:
    return db.query(Category).filter(Category.is_deleted.is_(False)).order_by(Category.id).all()


def create(db: Session, *, name: str) -> Category:
    category = Category(name=name, is_deleted=False)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update(db: Session, category: Category, *, name: str) -> Category:
    category.name = name
    db.commit()
    db.refresh(category)
    return category


def soft_delete(db: Session, category: Category) -> None:
    category.is_deleted = True
    db.commit()
