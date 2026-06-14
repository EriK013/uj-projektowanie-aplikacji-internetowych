from app.tests.conftest import login_as


def test_create_month(client, auth):
    r = client.post(
        "/months",
        json={"period": "04-2026", "opening_balance": "1500"},
        headers=auth,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["period"] == "04-2026"
    assert body["label"] == "Kwiecien 2026"


def test_invalid_period_format(client, auth):
    r = client.post("/months", json={"period": "2026-04"}, headers=auth)
    assert r.status_code == 422


def test_month_out_of_range(client, auth):
    r = client.post("/months", json={"period": "13-2026"}, headers=auth)
    assert r.status_code == 422


def test_duplicate_month(client, auth):
    client.post("/months", json={"period": "04-2026"}, headers=auth)
    r = client.post("/months", json={"period": "04-2026"}, headers=auth)
    assert r.status_code == 409


def test_list_without_token(client):
    r = client.get("/months")
    assert r.status_code == 401


def test_months_only_owner(client, auth):
    client.post("/months", json={"period": "04-2026"}, headers=auth)

    other = login_as(client, "obcy@test.pl")
    assert client.get("/months", headers=other).json() == []

    mine = client.get("/months", headers=auth).json()
    assert len(mine) == 1
    assert client.get(f"/months/{mine[0]['id']}", headers=other).status_code == 404
