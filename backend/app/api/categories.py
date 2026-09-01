from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin, verify_csrf_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.category import CategoryRequest, CategoryResponse
from app.services import category_service

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CategoryResponse]:
    return category_service.list_categories(db)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=201,
    dependencies=[Depends(verify_csrf_token)],
)
def create_category(
    payload: CategoryRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> CategoryResponse:
    return category_service.create_category(db, name=payload.name)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    dependencies=[Depends(verify_csrf_token)],
)
def update_category(
    category_id: int,
    payload: CategoryRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> CategoryResponse:
    return category_service.update_category(db, category_id=category_id, name=payload.name)


@router.delete(
    "/{category_id}",
    status_code=204,
    dependencies=[Depends(verify_csrf_token)],
)
def delete_category(
    category_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    category_service.delete_category(db, category_id=category_id)
