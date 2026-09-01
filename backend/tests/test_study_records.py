import itertools
from datetime import date, timedelta

from app.models.category import Category

_category_name_counter = itertools.count()


def register_and_login(client, username="owner", password="Password1"):
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


# --- 登録 ---


def test_create_study_record_success(client, db_session):
    register_and_login(client)
    response, category = create_record(client, db_session)
    assert response.status_code == 201
    body = response.json()
    assert body["category_id"] == category.id
    assert body["category_name"] == category.name
    assert body["title"] == "テストタイトル"


def test_create_study_record_requires_csrf(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    response = client.post("/api/study-records", json=valid_payload(category.id))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_create_study_record_requires_authentication(client, db_session):
    category = create_category(db_session)
    response = client.post("/api/study-records", json=valid_payload(category.id))
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_create_study_record_unauthenticated_with_invalid_csrf_still_401(client, db_session):
    category = create_category(db_session)
    response = client.post(
        "/api/study-records",
        json=valid_payload(category.id),
        headers={"X-CSRF-Token": "some-invalid-token"},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_create_study_record_authenticated_with_wrong_csrf_token(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    response = client.post(
        "/api/study-records",
        json=valid_payload(category.id),
        headers={"X-CSRF-Token": "wrong-token"},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_create_study_record_nonexistent_category(client, db_session):
    register_and_login(client)
    response = client.post(
        "/api/study-records",
        json=valid_payload(999999),
        headers=csrf_headers(client),
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_create_study_record_deleted_category(client, db_session):
    register_and_login(client)
    category = create_category(db_session, is_deleted=True)
    response = client.post(
        "/api/study-records",
        json=valid_payload(category.id),
        headers=csrf_headers(client),
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_create_study_record_user_id_cannot_be_overridden(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    payload = valid_payload(category.id)
    payload["user_id"] = 999999
    response = client.post("/api/study-records", json=payload, headers=csrf_headers(client))
    assert response.status_code == 201


def test_create_study_record_understanding_level_out_of_range(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    for level in (0, 6):
        response = client.post(
            "/api/study-records",
            json=valid_payload(category.id, understanding_level=level),
            headers=csrf_headers(client),
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_study_record_study_minutes_out_of_range(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    for minutes in (0, 1441):
        response = client.post(
            "/api/study-records",
            json=valid_payload(category.id, study_minutes=minutes),
            headers=csrf_headers(client),
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_study_record_future_study_date(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    tomorrow = str(date.today() + timedelta(days=1))
    response = client.post(
        "/api/study-records",
        json=valid_payload(category.id, study_date=tomorrow),
        headers=csrf_headers(client),
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


# --- 詳細取得 ---


def test_get_study_record_success(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    response = client.get(f"/api/study-records/{record_id}")
    assert response.status_code == 200
    assert response.json()["id"] == record_id


def test_get_study_record_not_found(client, db_session):
    register_and_login(client)
    response = client.get("/api/study-records/999999")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "STUDY_RECORD_NOT_FOUND"


def test_get_other_users_study_record_forbidden(client, db_session):
    register_and_login(client, username="owner")
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.post("/api/auth/logout", headers=csrf_headers(client))
    register_and_login(client, username="other")

    response = client.get(f"/api/study-records/{record_id}")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "STUDY_RECORD_FORBIDDEN"


def test_get_soft_deleted_study_record_returns_404(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))

    response = client.get(f"/api/study-records/{record_id}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "STUDY_RECORD_NOT_FOUND"


# --- 編集 ---


def test_update_study_record_success(client, db_session):
    register_and_login(client)
    create_response, category = create_record(client, db_session)
    record_id = create_response.json()["id"]

    payload = valid_payload(category.id, title="更新後タイトル")
    response = client.put(
        f"/api/study-records/{record_id}", json=payload, headers=csrf_headers(client)
    )
    assert response.status_code == 200
    assert response.json()["title"] == "更新後タイトル"


def test_update_study_record_requires_csrf(client, db_session):
    register_and_login(client)
    create_response, category = create_record(client, db_session)
    record_id = create_response.json()["id"]

    response = client.put(f"/api/study-records/{record_id}", json=valid_payload(category.id))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_update_other_users_study_record_forbidden(client, db_session):
    register_and_login(client, username="owner")
    create_response, category = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.post("/api/auth/logout", headers=csrf_headers(client))
    register_and_login(client, username="other")

    response = client.put(
        f"/api/study-records/{record_id}",
        json=valid_payload(category.id),
        headers=csrf_headers(client),
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "STUDY_RECORD_FORBIDDEN"


def test_update_nonexistent_study_record(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    response = client.put(
        "/api/study-records/999999",
        json=valid_payload(category.id),
        headers=csrf_headers(client),
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "STUDY_RECORD_NOT_FOUND"


def test_update_keeping_deleted_category_is_allowed(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]
    owned_category_id = create_response.json()["category_id"]

    from app.models.category import Category as CategoryModel

    db_category = (
        db_session.query(CategoryModel).filter(CategoryModel.id == owned_category_id).first()
    )
    db_category.is_deleted = True
    db_session.commit()

    payload = valid_payload(owned_category_id, title="タイトル変更のみ")
    response = client.put(
        f"/api/study-records/{record_id}", json=payload, headers=csrf_headers(client)
    )
    assert response.status_code == 200
    assert response.json()["title"] == "タイトル変更のみ"


def test_update_changing_to_deleted_category_rejected(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    deleted_category = create_category(db_session, name="DeletedCat", is_deleted=True)
    payload = valid_payload(deleted_category.id)
    response = client.put(
        f"/api/study-records/{record_id}", json=payload, headers=csrf_headers(client)
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "CATEGORY_NOT_FOUND"


def test_update_changing_to_valid_category_allowed(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    new_category = create_category(db_session, name="NewCat")
    payload = valid_payload(new_category.id)
    response = client.put(
        f"/api/study-records/{record_id}", json=payload, headers=csrf_headers(client)
    )
    assert response.status_code == 200
    assert response.json()["category_id"] == new_category.id


# --- 削除 ---


def test_delete_study_record_success(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    response = client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))
    assert response.status_code == 204

    get_response = client.get(f"/api/study-records/{record_id}")
    assert get_response.status_code == 404


def test_delete_study_record_requires_csrf(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    response = client.delete(f"/api/study-records/{record_id}")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CSRF_TOKEN_INVALID"


def test_delete_other_users_study_record_forbidden(client, db_session):
    register_and_login(client, username="owner")
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.post("/api/auth/logout", headers=csrf_headers(client))
    register_and_login(client, username="other")

    response = client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "STUDY_RECORD_FORBIDDEN"


def test_delete_already_deleted_study_record_returns_404(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))
    response = client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "STUDY_RECORD_NOT_FOUND"


# --- 一覧・検索・ページネーション ---


def test_list_study_records_pagination(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    for i in range(15):
        client.post(
            "/api/study-records",
            json=valid_payload(category.id, title=f"記録{i}"),
            headers=csrf_headers(client),
        )

    page1 = client.get("/api/study-records?page=1&page_size=10").json()
    assert len(page1["items"]) == 10
    assert page1["total"] == 15
    assert page1["total_pages"] == 2

    page2 = client.get("/api/study-records?page=2&page_size=10").json()
    assert len(page2["items"]) == 5


def test_list_study_records_default_page_size(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    for i in range(12):
        client.post(
            "/api/study-records",
            json=valid_payload(category.id, title=f"記録{i}"),
            headers=csrf_headers(client),
        )

    response = client.get("/api/study-records").json()
    assert response["page_size"] == 10
    assert len(response["items"]) == 10


def test_list_study_records_only_own_records(client, db_session):
    register_and_login(client, username="owner")
    create_record(client, db_session)

    client.post("/api/auth/logout", headers=csrf_headers(client))
    register_and_login(client, username="other")

    response = client.get("/api/study-records").json()
    assert response["total"] == 0


def test_list_study_records_keyword_search(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    client.post(
        "/api/study-records",
        json=valid_payload(category.id, title="Python入門", content="基礎"),
        headers=csrf_headers(client),
    )
    client.post(
        "/api/study-records",
        json=valid_payload(category.id, title="Java入門", content="基礎"),
        headers=csrf_headers(client),
    )

    response = client.get("/api/study-records?keyword=Python").json()
    assert response["total"] == 1
    assert response["items"][0]["title"] == "Python入門"


def test_list_study_records_keyword_matches_content(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    client.post(
        "/api/study-records",
        json=valid_payload(category.id, title="タイトルA", content="Djangoの学習"),
        headers=csrf_headers(client),
    )

    response = client.get("/api/study-records?keyword=Django").json()
    assert response["total"] == 1


def test_list_study_records_multiple_conditions_and(client, db_session):
    register_and_login(client)
    category_a = create_category(db_session, name="CategoryA")
    category_b = create_category(db_session, name="CategoryB")

    client.post(
        "/api/study-records",
        json=valid_payload(category_a.id, title="対象", understanding_level=5),
        headers=csrf_headers(client),
    )
    client.post(
        "/api/study-records",
        json=valid_payload(category_a.id, title="対象外レベル", understanding_level=1),
        headers=csrf_headers(client),
    )
    client.post(
        "/api/study-records",
        json=valid_payload(category_b.id, title="対象外カテゴリ", understanding_level=5),
        headers=csrf_headers(client),
    )

    response = client.get(
        f"/api/study-records?category_id={category_a.id}&understanding_level=5"
    ).json()
    assert response["total"] == 1
    assert response["items"][0]["title"] == "対象"


def test_list_study_records_date_range(client, db_session):
    register_and_login(client)
    category = create_category(db_session)
    today = date.today()
    old_date = today - timedelta(days=10)

    client.post(
        "/api/study-records",
        json=valid_payload(category.id, title="範囲内", study_date=str(today)),
        headers=csrf_headers(client),
    )
    client.post(
        "/api/study-records",
        json=valid_payload(category.id, title="範囲外", study_date=str(old_date)),
        headers=csrf_headers(client),
    )

    from_date = today - timedelta(days=1)
    response = client.get(f"/api/study-records?from={from_date}&to={today}").json()
    assert response["total"] == 1
    assert response["items"][0]["title"] == "範囲内"


def test_list_study_records_excludes_soft_deleted(client, db_session):
    register_and_login(client)
    create_response, _ = create_record(client, db_session)
    record_id = create_response.json()["id"]

    client.delete(f"/api/study-records/{record_id}", headers=csrf_headers(client))

    response = client.get("/api/study-records").json()
    assert response["total"] == 0


def test_list_study_records_requires_authentication(client, db_session):
    response = client.get("/api/study-records")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
