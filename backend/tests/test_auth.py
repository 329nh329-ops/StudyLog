def register(client, username="testuser", password="Password1"):
    return client.post(
        "/api/auth/register",
        json={
            "username": username,
            "password": password,
            "password_confirmation": password,
        },
    )


def test_register_success(client):
    response = register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "testuser"
    assert body["role"] == "USER"


def test_register_duplicate_username(client):
    register(client)
    response = register(client)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "USERNAME_ALREADY_EXISTS"


def test_register_password_mismatch(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "password": "Password1",
            "password_confirmation": "Different1",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_register_weak_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "password": "password",
            "password_confirmation": "password",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_login_success_sets_cookies(client):
    register(client)
    response = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "Password1"}
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "csrf_token" in response.cookies


def test_login_wrong_password(client):
    register(client)
    response = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "WrongPass1"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_nonexistent_user_same_error(client):
    register(client)
    wrong_password_response = client.post(
        "/api/auth/login", json={"username": "testuser", "password": "WrongPass1"}
    )
    nonexistent_user_response = client.post(
        "/api/auth/login", json={"username": "nouser", "password": "Password1"}
    )
    assert wrong_password_response.status_code == nonexistent_user_response.status_code == 401
    assert (
        wrong_password_response.json()["error"]["message"]
        == nonexistent_user_response.json()["error"]["message"]
    )


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_me_returns_current_user(client):
    register(client)
    client.post("/api/auth/login", json={"username": "testuser", "password": "Password1"})
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_logout_requires_csrf_token(client):
    register(client)
    client.post("/api/auth/login", json={"username": "testuser", "password": "Password1"})
    response = client.post("/api/auth/logout")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_logout_with_csrf_token_clears_cookies(client):
    register(client)
    client.post("/api/auth/login", json={"username": "testuser", "password": "Password1"})
    csrf_token = client.cookies.get("csrf_token")

    response = client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf_token})
    assert response.status_code == 204

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 401


def test_logout_with_mismatched_csrf_token_rejected(client):
    register(client)
    client.post("/api/auth/login", json={"username": "testuser", "password": "Password1"})

    response = client.post("/api/auth/logout", headers={"X-CSRF-Token": "wrong-token"})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"
