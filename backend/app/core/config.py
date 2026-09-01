from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    cookie_secure: bool = False
    timezone: str = "Asia/Tokyo"

    access_token_cookie_name: str = "access_token"
    csrf_token_cookie_name: str = "csrf_token"
    csrf_token_header_name: str = "X-CSRF-Token"

    cors_allow_origins: list[str] = ["http://localhost:3000"]

    seed_admin_username: str = "admin"
    seed_admin_password: str = "ChangeMe123"


settings = Settings()
