from datetime import timedelta

from app.core.clock import today_jst
from app.models.category import Category


def register_and_login(client, username="dashuser", password="Password1"):
    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "password": password,
            "password_confirmation": password,
        },
    )
    client.post("/api/auth/login", json={"username": username, "password": password})


def csrf_headers(client):
    return {"X-CSRF-Token": client.cookies.get("csrf_token")}


def create_category(db_session, name="DashCat"):
    category = Category(name=name, is_deleted=False)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


def create_record(client, category_id, *, study_minutes=60, study_date=None, title="記録"):
    payload = {
        "category_id": category_id,
        "title": title,
        "content": "内容",
        "understanding_level": 3,
        "study_minutes": study_minutes,
        "study_date": str(study_date or today_jst()),
    }
    return client.post("/api/study-records", json=payload, headers=csrf_headers(client))


def test_dashboard_requires_authentication(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_dashboard_empty_when_no_records(client, db_session):
    register_and_login(client)
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert body["today_minutes"] == 0
    assert body["streak_days"] == 0
    assert len(body["daily_totals"]) == 7
    assert all(d["minutes"] == 0 for d in body["daily_totals"])
    assert body["category_totals"] == []
    assert len(body["monthly_totals"]) == 6
    assert body["recent_records"] == []


def test_dashboard_today_minutes(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    create_record(client, category.id, study_minutes=30)
    create_record(client, category.id, study_minutes=45)

    response = client.get("/api/dashboard")
    assert response.json()["today_minutes"] == 75


def test_dashboard_excludes_other_users_records(client, db_session):
    register_and_login(client, username="dashowner")
    category = create_category(db_session)
    create_record(client, category.id, study_minutes=100)

    client.post("/api/auth/logout", headers=csrf_headers(client))
    register_and_login(client, username="dashother")

    response = client.get("/api/dashboard")
    assert response.json()["today_minutes"] == 0


def test_dashboard_excludes_deleted_records(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    create_response = create_record(client, category.id, study_minutes=50)
    record_id = create_response.json()["id"]

    client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))

    response = client.get("/api/dashboard")
    assert response.json()["today_minutes"] == 0


def test_dashboard_streak_today_only(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    create_record(client, category.id, study_date=today_jst())

    response = client.get("/api/dashboard")
    assert response.json()["streak_days"] == 1


def test_dashboard_streak_multiple_consecutive_days(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    create_record(client, category.id, study_date=today, title="today")
    create_record(client, category.id, study_date=today - timedelta(days=1), title="yesterday")
    create_record(client, category.id, study_date=today - timedelta(days=2), title="2 days ago")

    response = client.get("/api/dashboard")
    assert response.json()["streak_days"] == 3


def test_dashboard_streak_continues_from_yesterday_when_no_record_today(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    create_record(client, category.id, study_date=today - timedelta(days=1), title="yesterday")
    create_record(client, category.id, study_date=today - timedelta(days=2), title="2 days ago")

    response = client.get("/api/dashboard")
    assert response.json()["streak_days"] == 2


def test_dashboard_streak_zero_when_gap_of_two_days(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    create_record(client, category.id, study_date=today - timedelta(days=2), title="2 days ago")

    response = client.get("/api/dashboard")
    assert response.json()["streak_days"] == 0


def test_dashboard_daily_totals_within_range(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    create_record(client, category.id, study_minutes=20, study_date=today)
    create_record(
        client, category.id, study_minutes=40, study_date=today - timedelta(days=3), title="old"
    )
    create_record(
        client,
        category.id,
        study_minutes=999,
        study_date=today - timedelta(days=10),
        title="out of range",
    )

    response = client.get("/api/dashboard")
    daily_totals = {d["date"]: d["minutes"] for d in response.json()["daily_totals"]}
    assert daily_totals[str(today)] == 20
    assert daily_totals[str(today - timedelta(days=3))] == 40
    assert sum(daily_totals.values()) == 60


def test_dashboard_category_totals_current_month(client, db_session):
    register_and_login(client)
    category_a = create_category(db_session, name="DashCatA")
    category_b = create_category(db_session, name="DashCatB")
    today = today_jst()
    create_record(client, category_a.id, study_minutes=30, study_date=today, title="a")
    create_record(client, category_b.id, study_minutes=15, study_date=today, title="b")

    response = client.get("/api/dashboard")
    totals = {c["category_name"]: c["minutes"] for c in response.json()["category_totals"]}
    assert totals["DashCatA"] == 30
    assert totals["DashCatB"] == 15


def test_dashboard_monthly_totals_includes_current_month(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    create_record(client, category.id, study_minutes=50, study_date=today)

    response = client.get("/api/dashboard")
    monthly_totals = {m["month"]: m["minutes"] for m in response.json()["monthly_totals"]}
    current_month_key = today.strftime("%Y-%m")
    assert monthly_totals[current_month_key] == 50
    assert len(monthly_totals) == 6


def test_dashboard_recent_records_limit_and_order(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = today_jst()
    for i in range(7):
        create_record(
            client,
            category.id,
            study_date=today - timedelta(days=i),
            title=f"記録{i}",
        )

    response = client.get("/api/dashboard")
    recent = response.json()["recent_records"]
    assert len(recent) == 5
    assert recent[0]["title"] == "記録0"
    assert recent[-1]["title"] == "記録4"
