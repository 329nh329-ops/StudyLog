from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, verify_csrf_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.study_record import (
    StudyRecordListResponse,
    StudyRecordRequest,
    StudyRecordResponse,
)
from app.services import study_record_service

router = APIRouter(prefix="/api/study-records", tags=["study-records"])


def _to_response(record) -> StudyRecordResponse:
    return StudyRecordResponse(
        id=record.id,
        category_id=record.category_id,
        category_name=record.category.name,
        title=record.title,
        content=record.content,
        understanding_level=record.understanding_level,
        study_minutes=record.study_minutes,
        study_date=record.study_date,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.get("", response_model=StudyRecordListResponse)
def list_study_records(
    keyword: str | None = None,
    category_id: int | None = None,
    understanding_level: int | None = None,
    date_from: date | None = Query(None, alias="from"),
    date_to: date | None = Query(None, alias="to"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudyRecordListResponse:
    items, total = study_record_service.list_study_records(
        db,
        user_id=current_user.id,
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
        items=[_to_response(record) for record in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@router.get("/{record_id}", response_model=StudyRecordResponse)
def get_study_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudyRecordResponse:
    record = study_record_service.get_study_record(db, record_id=record_id, user_id=current_user.id)
    return _to_response(record)


@router.post(
    "",
    response_model=StudyRecordResponse,
    status_code=201,
    dependencies=[Depends(verify_csrf_token)],
)
def create_study_record(
    payload: StudyRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudyRecordResponse:
    record = study_record_service.create_study_record(
        db, user_id=current_user.id, fields=payload.model_dump()
    )
    return _to_response(record)


@router.put(
    "/{record_id}",
    response_model=StudyRecordResponse,
    dependencies=[Depends(verify_csrf_token)],
)
def update_study_record(
    record_id: int,
    payload: StudyRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudyRecordResponse:
    record = study_record_service.update_study_record(
        db, record_id=record_id, user_id=current_user.id, fields=payload.model_dump()
    )
    return _to_response(record)


@router.delete(
    "/{record_id}",
    status_code=204,
    dependencies=[Depends(verify_csrf_token)],
)
def delete_study_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    study_record_service.delete_study_record(db, record_id=record_id, user_id=current_user.id)
