from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.study_record import StudyRecordListResponse, StudyRecordResponse
from app.schemas.user import UserResponse
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[UserResponse]:
    return admin_service.list_users(db)


@router.get("/users/{user_id}/study-records", response_model=StudyRecordListResponse)
def list_user_study_records(
    user_id: int,
    keyword: str | None = None,
    category_id: int | None = None,
    understanding_level: int | None = None,
    date_from: date | None = Query(None, alias="from"),
    date_to: date | None = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> StudyRecordListResponse:
    items, total = admin_service.list_user_study_records(
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
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    return StudyRecordListResponse(
        items=[StudyRecordResponse.from_model(record) for record in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )
