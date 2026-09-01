from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.categories import router as categories_router
from app.api.study_records import router as study_records_router
from app.core.config import settings
from app.exceptions.handlers import register_exception_handlers

app = FastAPI(title="StudyLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(study_records_router)
app.include_router(categories_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
