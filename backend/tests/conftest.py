import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = settings.database_url


@pytest.fixture(scope="session", autouse=True)
def _create_test_database():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session():
    engine = create_engine(TEST_DATABASE_URL)
    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_local()
    try:
        yield session
    finally:
        session.close()
        with engine.connect() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
            for table in Base.metadata.sorted_tables:
                conn.execute(text(f"TRUNCATE TABLE {table.name}"))
            conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
            conn.commit()
        engine.dispose()


@pytest.fixture
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
