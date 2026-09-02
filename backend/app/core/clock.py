from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.core.config import settings

JST = ZoneInfo(settings.timezone)


def today_jst() -> date:
    return datetime.now(JST).date()
