from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.exceptions.exceptions import AppError


def _error_body(code: str, message: str, details: dict | None = None) -> dict:
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.code, exc.message, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = {}
        for error in exc.errors():
            field = ".".join(str(part) for part in error["loc"][1:]) or "_"
            message = error["msg"]
            if message.startswith("Value error, "):
                message = message.removeprefix("Value error, ")
            details[field] = message
        return JSONResponse(
            status_code=422,
            content=_error_body("VALIDATION_ERROR", "入力内容に誤りがあります", details),
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content=_error_body("INTERNAL_SERVER_ERROR", "サーバーエラーが発生しました"),
        )
