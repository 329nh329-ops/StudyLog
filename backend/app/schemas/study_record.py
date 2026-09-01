from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator


class StudyRecordRequest(BaseModel):
    category_id: int
    title: str
    content: str
    understanding_level: int
    study_minutes: int
    study_date: date

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        if not (1 <= len(value) <= 100):
            raise ValueError("タイトルは1〜100文字で入力してください")
        return value

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        if len(value) < 1:
            raise ValueError("学習内容は1文字以上で入力してください")
        return value

    @field_validator("understanding_level")
    @classmethod
    def validate_understanding_level(cls, value: int) -> int:
        if not (1 <= value <= 5):
            raise ValueError("理解度は1〜5で入力してください")
        return value

    @field_validator("study_minutes")
    @classmethod
    def validate_study_minutes(cls, value: int) -> int:
        if not (1 <= value <= 1440):
            raise ValueError("学習時間は1〜1440分で入力してください")
        return value

    @field_validator("study_date")
    @classmethod
    def validate_study_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("学習日には今日以前の日付を指定してください")
        return value


class StudyRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    category_name: str
    title: str
    content: str
    understanding_level: int
    study_minutes: int
    study_date: date
    created_at: datetime
    updated_at: datetime


class StudyRecordListResponse(BaseModel):
    items: list[StudyRecordResponse]
    page: int
    page_size: int
    total: int
    total_pages: int
