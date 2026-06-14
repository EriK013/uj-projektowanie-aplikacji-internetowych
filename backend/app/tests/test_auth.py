def test_register(client):
    r = client.post("/auth/register", json={"email": "ala@test.pl", "password": "haslo123"})
    assert r.status_code == 201
    assert r.json()["email"] == "ala@test.pl"


def test_register_taken_email(client):
    client.post("/auth/register", json={"email": "ala@test.pl", "password": "haslo123"})
    r = client.post("/auth/register", json={"email": "ala@test.pl", "password": "innehaslo"})
    assert r.status_code == 409


def test_register_short_password(client):
    r = client.post("/auth/register", json={"email": "ala@test.pl", "password": "abc"})
    assert r.status_code == 422


def test_login(client):
    client.post("/auth/register", json={"email": "ala@test.pl", "password": "haslo123"})
    r = client.post("/auth/login", data={"username": "ala@test.pl", "password": "haslo123"})
    assert r.status_code == 200
    assert r.json()["access_token"]


def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "ala@test.pl", "password": "haslo123"})
    r = client.post("/auth/login", data={"username": "ala@test.pl", "password": "zlehaslo"})
    assert r.status_code == 401


def test_me_without_token(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_with_token(client, auth):
    r = client.get("/auth/me", headers=auth)
    assert r.status_code == 200
    assert r.json()["email"] == "jan@test.pl"
