import itertools
from datetime import date

from app.models.category import Category
from app.models.user import User

_category_name_counter = itertools.count()


def register_and_login(client, username="user1", password="Password1"):
    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "password": password,
            "password_confirmation": password,
        },
    )
    client.post("/api/auth/login", json={"username": username, "password": password})


def promote_to_admin(db_session, username):
    user = db_session.query(User).filter(User.username == username).first()
    user.role = "ADMIN"
    db_session.commit()


def register_and_login_as_admin(client, db_session, username="adminuser"):
    register_and_login(client, username=username)
    promote_to_admin(db_session, username)
    client.post("/api/auth/logout", headers=csrf_headers(client))
    client.post("/api/auth/login", json={"username": username, "password": "Password1"})


def csrf_headers(client):
    return {"X-CSRF-Token": client.cookies.get("csrf_token")}


def create_category(db_session, name=None, is_deleted=False):
    if name is None:
        name = f"TestCategory{next(_category_name_counter)}"
    category = Category(name=name, is_deleted=is_deleted)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


def valid_payload(category_id, **overrides):
    payload = {
        "category_id": category_id,
        "title": "テストタイトル",
        "content": "テスト内容",
        "understanding_level": 3,
        "study_minutes": 60,
        "study_date": str(date.today()),
    }
    payload.update(overrides)
    return payload


def create_record(client, db_session, **overrides):
    category = create_category(db_session)
    payload = valid_payload(category.id, **overrides)
    response = client.post("/api/study-records", json=payload, headers=csrf_headers(client))
    return response, category


# --- ユーザー一覧 ---


def test_list_users_success(client, db_session):
    register_and_login(client, username="alice")
    register_and_login_as_admin(client, db_session, username="adminuser")

    response = client.get("/api/admin/users")
    assert response.status_code == 200
    usernames = {u["username"] for u in response.json()}
    assert {"alice", "adminuser"} <= usernames


def test_list_users_requires_authentication(client, db_session):
    response = client.get("/api/admin/users")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_list_users_forbidden_for_non_admin(client, db_session):
    register_and_login(client, username="bob")
    response = client.get("/api/admin/users")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ADMIN_REQUIRED"


# --- 他ユーザーの学習記録閲覧 ---


def test_list_user_study_records_success(client, db_session):
    register_and_login(client, username="owner")
    response, _ = create_record(client, db_session)
    assert response.status_code == 201
    owner = db_session.query(User).filter(User.username == "owner").first()

    register_and_login_as_admin(client, db_session, username="adminuser")
    response = client.get(f"/api/admin/users/{owner.id}/study-records")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["title"] == "テストタイトル"


def test_list_user_study_records_excludes_deleted(client, db_session):
    register_and_login(client, username="owner")
    response, _ = create_record(client, db_session)
    record_id = response.json()["id"]
    client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))
    owner = db_session.query(User).filter(User.username == "owner").first()

    register_and_login_as_admin(client, db_session, username="adminuser")
    response = client.get(f"/api/admin/users/{owner.id}/study-records")
    assert response.json()["total"] == 0


def test_list_user_study_records_forbidden_for_non_admin(client, db_session):
    register_and_login(client, username="owner")
    owner = db_session.query(User).filter(User.username == "owner").first()

    register_and_login(client, username="bob")
    response = client.get(f"/api/admin/users/{owner.id}/study-records")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ADMIN_REQUIRED"


def test_list_user_study_records_nonexistent_user(client, db_session):
    register_and_login_as_admin(client, db_session, username="adminuser")
    response = client.get("/api/admin/users/999999/study-records")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "USER_NOT_FOUND"


def test_list_user_study_records_admin_can_view_own_records(client, db_session):
    register_and_login_as_admin(client, db_session, username="adminuser")
    response, _ = create_record(client, db_session)
    assert response.status_code == 201
    admin = db_session.query(User).filter(User.username == "adminuser").first()

    response = client.get(f"/api/admin/users/{admin.id}/study-records")
    assert response.status_code == 200
    assert response.json()["total"] == 1
