from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.clock import today_jst
from app.repositories import study_record_repository

DAILY_CHART_DAYS = 7
MONTHLY_CHART_MONTHS = 6
RECENT_RECORDS_LIMIT = 5


def _add_months(target: date, months: int) -> date:
    total_month_index = target.month - 1 + months
    year = target.year + total_month_index // 12
    month = total_month_index % 12 + 1
    return date(year, month, 1)


def _last_day_of_month(target: date) -> date:
    next_month_start = _add_months(target, 1)
    return next_month_start - timedelta(days=1)


def _calculate_streak_days(study_dates: set[date]) -> int:
    today = today_jst()
    if today in study_dates:
        current = today
    elif (today - timedelta(days=1)) in study_dates:
        current = today - timedelta(days=1)
    else:
        return 0

    streak = 0
    while current in study_dates:
        streak += 1
        current -= timedelta(days=1)
    return streak


def get_dashboard(db: Session, *, user_id: int) -> dict:
    today = today_jst()

    today_minutes = study_record_repository.get_total_minutes_for_date(
        db, user_id=user_id, target_date=today
    )

    study_dates = study_record_repository.get_study_dates(db, user_id=user_id)
    streak_days = _calculate_streak_days(study_dates)

    daily_from = today - timedelta(days=DAILY_CHART_DAYS - 1)
    daily_totals_map = study_record_repository.get_daily_totals(
        db, user_id=user_id, date_from=daily_from, date_to=today
    )
    daily_totals = [
        {
            "date": daily_from + timedelta(days=i),
            "minutes": daily_totals_map.get(daily_from + timedelta(days=i), 0),
        }
        for i in range(DAILY_CHART_DAYS)
    ]

    month_start = today.replace(day=1)
    month_end = _last_day_of_month(today)
    category_totals = [
        {"category_id": category_id, "category_name": category_name, "minutes": minutes}
        for category_id, category_name, minutes in study_record_repository.get_category_totals(
            db, user_id=user_id, date_from=month_start, date_to=month_end
        )
    ]

    monthly_from = _add_months(month_start, -(MONTHLY_CHART_MONTHS - 1))
    monthly_totals_map = study_record_repository.get_monthly_totals(
        db, user_id=user_id, date_from=monthly_from, date_to=month_end
    )
    monthly_totals = []
    for i in range(MONTHLY_CHART_MONTHS):
        month = _add_months(monthly_from, i)
        key = month.strftime("%Y-%m")
        monthly_totals.append({"month": key, "minutes": monthly_totals_map.get(key, 0)})

    recent_records = study_record_repository.get_recent_records(
        db, user_id=user_id, limit=RECENT_RECORDS_LIMIT
    )

    return {
        "today_minutes": today_minutes,
        "streak_days": streak_days,
        "daily_totals": daily_totals,
        "category_totals": category_totals,
        "monthly_totals": monthly_totals,
        "recent_records": recent_records,
    }
