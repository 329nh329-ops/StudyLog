from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.schemas.study_record import StudyRecordResponse
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    data = dashboard_service.get_dashboard(db, user_id=current_user.id)
    return DashboardResponse(
        today_minutes=data["today_minutes"],
        streak_days=data["streak_days"],
        daily_totals=data["daily_totals"],
        category_totals=data["category_totals"],
        monthly_totals=data["monthly_totals"],
        recent_records=[
            StudyRecordResponse.from_model(record) for record in data["recent_records"]
        ],
    )
