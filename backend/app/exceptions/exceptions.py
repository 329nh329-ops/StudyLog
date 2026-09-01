class AppError(Exception):
    status_code: int = 400
    code: str = "INVALID_REQUEST"

    def __init__(self, message: str, details: dict | None = None):
        self.message = message
        self.details = details
        super().__init__(message)


class AuthenticationRequiredError(AppError):
    status_code = 401
    code = "AUTHENTICATION_REQUIRED"


class InvalidCredentialsError(AppError):
    status_code = 401
    code = "INVALID_CREDENTIALS"


class InvalidTokenError(AppError):
    status_code = 401
    code = "INVALID_TOKEN"


class TokenExpiredError(AppError):
    status_code = 401
    code = "TOKEN_EXPIRED"


class AdminRequiredError(AppError):
    status_code = 403
    code = "ADMIN_REQUIRED"


class CsrfTokenInvalidError(AppError):
    status_code = 403
    code = "CSRF_TOKEN_INVALID"


class UsernameAlreadyExistsError(AppError):
    status_code = 409
    code = "USERNAME_ALREADY_EXISTS"


class ValidationError(AppError):
    status_code = 422
    code = "VALIDATION_ERROR"
