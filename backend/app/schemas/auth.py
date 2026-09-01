import re

from pydantic import BaseModel, field_validator, model_validator

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,25}$")
PASSWORD_LOWER_PATTERN = re.compile(r"[a-z]")
PASSWORD_UPPER_PATTERN = re.compile(r"[A-Z]")
PASSWORD_DIGIT_PATTERN = re.compile(r"[0-9]")


def validate_password_strength(password: str) -> str:
    if not (1 <= len(password) <= 50):
        raise ValueError("パスワードは50文字以内で入力してください")
    if not PASSWORD_LOWER_PATTERN.search(password):
        raise ValueError("パスワードは小文字を1文字以上含めてください")
    if not PASSWORD_UPPER_PATTERN.search(password):
        raise ValueError("パスワードは大文字を1文字以上含めてください")
    if not PASSWORD_DIGIT_PATTERN.search(password):
        raise ValueError("パスワードは数字を1文字以上含めてください")
    return password


class RegisterRequest(BaseModel):
    username: str
    password: str
    password_confirmation: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not USERNAME_PATTERN.match(value):
            raise ValueError(
                "ユーザー名は1〜25文字の半角英数字・ハイフン・アンダースコアで入力してください"
            )
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @model_validator(mode="after")
    def validate_password_match(self) -> "RegisterRequest":
        if self.password != self.password_confirmation:
            raise ValueError("パスワードが一致しません")
        return self


class LoginRequest(BaseModel):
    username: str
    password: str
