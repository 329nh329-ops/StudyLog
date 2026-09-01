from app.models.category import Category
from app.models.user import User


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


def create_category(db_session, name, is_deleted=False):
    category = Category(name=name, is_deleted=is_deleted)
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


# --- 一覧 ---


def test_list_categories_success(client, db_session):
    register_and_login(client)
    create_category(db_session, "TestCatAlpha")
    create_category(db_session, "TestCatBeta")

    response = client.get("/api/categories")
    assert response.status_code == 200
    names = {c["name"] for c in response.json()}
    assert {"TestCatAlpha", "TestCatBeta"} <= names


def test_list_categories_excludes_deleted(client, db_session):
    register_and_login(client)
    create_category(db_session, "Active")
    create_category(db_session, "Deleted", is_deleted=True)

    response = client.get("/api/categories")
    names = {c["name"] for c in response.json()}
    assert names == {"Active"}


def test_list_categories_requires_authentication(client, db_session):
    response = client.get("/api/categories")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_list_categories_allowed_for_user_role(client, db_session):
    register_and_login(client)
    create_category(db_session, "TestCatGamma")
    response = client.get("/api/categories")
    assert response.status_code == 200


# --- 追加 ---


def test_create_category_success_as_admin(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.post("/api/categories", json={"name": "Rust"}, headers=csrf_headers(client))
    assert response.status_code == 201
    assert response.json()["name"] == "Rust"


def test_create_category_forbidden_for_user(client, db_session):
    register_and_login(client)
    response = client.post("/api/categories", json={"name": "Rust"}, headers=csrf_headers(client))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ADMIN_REQUIRED"


def test_create_category_requires_authentication(client, db_session):
    response = client.post("/api/categories", json={"name": "Rust"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_create_category_requires_csrf(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.post("/api/categories", json={"name": "Rust"})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_create_category_duplicate_name_rejected(client, db_session):
    register_and_login_as_admin(client, db_session)
    create_category(db_session, "Rust")
    response = client.post("/api/categories", json={"name": "Rust"}, headers=csrf_headers(client))
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CATEGORY_ALREADY_EXISTS"


def test_create_category_same_name_as_deleted_allowed(client, db_session):
    register_and_login_as_admin(client, db_session)
    create_category(db_session, "Rust", is_deleted=True)
    response = client.post("/api/categories", json={"name": "Rust"}, headers=csrf_headers(client))
    assert response.status_code == 201


def test_create_category_name_too_long_rejected(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.post("/api/categories", json={"name": "a" * 51}, headers=csrf_headers(client))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_category_empty_name_rejected(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.post("/api/categories", json={"name": ""}, headers=csrf_headers(client))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_category_with_symbols_allowed(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.post(
        "/api/categories", json={"name": "Next.js"}, headers=csrf_headers(client)
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Next.js"


# --- 変更 ---


def test_update_category_success(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "OldName")
    response = client.put(
        f"/api/categories/{category.id}",
        json={"name": "NewName"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 200
    assert response.json()["name"] == "NewName"


def test_update_category_forbidden_for_user(client, db_session):
    register_and_login(client)
    category = create_category(db_session, "OldName")
    response = client.put(
        f"/api/categories/{category.id}",
        json={"name": "NewName"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ADMIN_REQUIRED"


def test_update_category_requires_csrf(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "OldName")
    response = client.put(f"/api/categories/{category.id}", json={"name": "NewName"})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_update_category_not_found(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.put(
        "/api/categories/999999", json={"name": "NewName"}, headers=csrf_headers(client)
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_update_deleted_category_not_found(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "Deleted", is_deleted=True)
    response = client.put(
        f"/api/categories/{category.id}",
        json={"name": "NewName"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_update_category_keeping_same_name_allowed(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "SameName")
    response = client.put(
        f"/api/categories/{category.id}",
        json={"name": "SameName"},
        headers=csrf_headers(client),
    )
    assert response.status_code == 200
    assert response.json()["name"] == "SameName"


def test_update_category_to_duplicate_name_rejected(client, db_session):
    register_and_login_as_admin(client, db_session)
    create_category(db_session, "Taken")
    category = create_category(db_session, "Original")
    response = client.put(
        f"/api/categories/{category.id}", json={"name": "Taken"}, headers=csrf_headers(client)
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CATEGORY_ALREADY_EXISTS"


# --- 論理削除 ---


def test_delete_category_success(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "ToDelete")
    response = client.delete(f"/api/categories/{category.id}", headers=csrf_headers(client))
    assert response.status_code == 204

    list_response = client.get("/api/categories")
    names = {c["name"] for c in list_response.json()}
    assert "ToDelete" not in names


def test_delete_category_forbidden_for_user(client, db_session):
    register_and_login(client)
    category = create_category(db_session, "ToDelete")
    response = client.delete(f"/api/categories/{category.id}", headers=csrf_headers(client))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "ADMIN_REQUIRED"


def test_delete_category_requires_csrf(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "ToDelete")
    response = client.delete(f"/api/categories/{category.id}")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_delete_category_not_found(client, db_session):
    register_and_login_as_admin(client, db_session)
    response = client.delete("/api/categories/999999", headers=csrf_headers(client))
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_delete_already_deleted_category_returns_404(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "ToDelete")
    client.delete(f"/api/categories/{category.id}", headers=csrf_headers(client))
    response = client.delete(f"/api/categories/{category.id}", headers=csrf_headers(client))
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_delete_category_same_name_can_be_recreated(client, db_session):
    register_and_login_as_admin(client, db_session)
    category = create_category(db_session, "Recyclable")
    client.delete(f"/api/categories/{category.id}", headers=csrf_headers(client))

    response = client.post(
        "/api/categories", json={"name": "Recyclable"}, headers=csrf_headers(client)
    )
    assert response.status_code == 201
