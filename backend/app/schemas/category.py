from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class CategoryRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not (1 <= len(value) <= 50):
            raise ValueError("カテゴリ名は1〜50文字で入力してください")
        return value


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    updated_at: datetime
