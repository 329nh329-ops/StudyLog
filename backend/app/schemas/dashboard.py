from datetime import date

from pydantic import BaseModel

from app.schemas.study_record import StudyRecordResponse


class DailyTotal(BaseModel):
    date: date
    minutes: int


class CategoryTotal(BaseModel):
    category_id: int
    category_name: str
    minutes: int


class MonthlyTotal(BaseModel):
    month: str
    minutes: int


class DashboardResponse(BaseModel):
    today_minutes: int
    streak_days: int
    daily_totals: list[DailyTotal]
    category_totals: list[CategoryTotal]
    monthly_totals: list[MonthlyTotal]
    recent_records: list[StudyRecordResponse]
