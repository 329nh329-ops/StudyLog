from __future__ import annotations

from sqlalchemy.orm import Session

from app.exceptions.exceptions import CategoryAlreadyExistsError, CategoryNotFoundError
from app.models.category import Category
from app.repositories import category_repository


def list_categories(db: Session) -> list[Category]:
    return category_repository.list_active(db)


def create_category(db: Session, *, name: str) -> Category:
    existing = category_repository.get_active_by_name(db, name)
    if existing is not None:
        raise CategoryAlreadyExistsError("このカテゴリ名は既に使用されています")
    return category_repository.create(db, name=name)


def update_category(db: Session, *, category_id: int, name: str) -> Category:
    category = category_repository.get_active_by_id(db, category_id)
    if category is None:
        raise CategoryNotFoundError("指定されたカテゴリが見つかりません")

    existing = category_repository.get_active_by_name(db, name)
    if existing is not None and existing.id != category_id:
        raise CategoryAlreadyExistsError("このカテゴリ名は既に使用されています")

    return category_repository.update(db, category, name=name)


def delete_category(db: Session, *, category_id: int) -> None:
    category = category_repository.get_active_by_id(db, category_id)
    if category is None:
        raise CategoryNotFoundError("指定されたカテゴリが見つかりません")
    category_repository.soft_delete(db, category)
