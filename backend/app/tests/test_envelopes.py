from decimal import Decimal


def prepare(client, auth, kind="expense", name="Jedzenie"):
    month = client.post(
        "/months",
        json={"period": "04-2026", "opening_balance": "1000"},
        headers=auth,
    ).json()
    category = client.post(
        "/categories", json={"name": name, "kind": kind}, headers=auth
    ).json()
    return month, category


def test_create_envelope(client, auth):
    month, category = prepare(client, auth)
    r = client.post(
        "/envelopes",
        json={
            "month_id": month["id"],
            "category_id": category["id"],
            "planned": "800",
            "spent": "200",
        },
        headers=auth,
    )
    assert r.status_code == 201
    body = r.json()
    assert Decimal(str(body["planned"])) == Decimal("800")
    assert Decimal(str(body["spent"])) == Decimal("200")


def test_duplicate_envelope(client, auth):
    month, category = prepare(client, auth)
    data = {"month_id": month["id"], "category_id": category["id"]}
    client.post("/envelopes", json=data, headers=auth)
    r = client.post("/envelopes", json=data, headers=auth)
    assert r.status_code == 409


def test_negative_amounts(client, auth):
    month, category = prepare(client, auth)
    r = client.post(
        "/envelopes",
        json={
            "month_id": month["id"],
            "category_id": category["id"],
            "planned": "-100",
        },
        headers=auth,
    )
    assert r.status_code == 422


def test_update_envelope(client, auth):
    month, category = prepare(client, auth)
    envelope = client.post(
        "/envelopes",
        json={"month_id": month["id"], "category_id": category["id"], "planned": "500"},
        headers=auth,
    ).json()

    r = client.put(f"/envelopes/{envelope['id']}", json={"spent": "300"}, headers=auth)
    assert r.status_code == 200
    body = r.json()
    assert Decimal(str(body["spent"])) == Decimal("300")
    assert Decimal(str(body["planned"])) == Decimal("500")


def test_delete_category_in_use(client, auth):
    month, category = prepare(client, auth)
    client.post(
        "/envelopes",
        json={"month_id": month["id"], "category_id": category["id"]},
        headers=auth,
    )
    r = client.delete(f"/categories/{category['id']}", headers=auth)
    assert r.status_code == 409


def test_summary_calculates_balances(client, auth):
    month, food = prepare(client, auth)
    salary = client.post(
        "/categories", json={"name": "Wyplata", "kind": "income"}, headers=auth
    ).json()

    client.post(
        "/envelopes",
        json={
            "month_id": month["id"],
            "category_id": salary["id"],
            "planned": "3000",
            "spent": "3000",
        },
        headers=auth,
    )
    client.post(
        "/envelopes",
        json={
            "month_id": month["id"],
            "category_id": food["id"],
            "planned": "800",
            "spent": "200",
        },
        headers=auth,
    )

    r = client.get(f"/months/{month['id']}/summary", headers=auth)
    assert r.status_code == 200
    totals = r.json()["totals"]

    assert Decimal(str(totals["current_balance"])) == Decimal("3800")
    assert Decimal(str(totals["predicted_balance"])) == Decimal("3200")
    assert Decimal(str(totals["unallocated"])) == Decimal("2200")

    envelopes = {e["name"]: e for e in r.json()["envelopes"]}
    assert envelopes["Jedzenie"]["pct"] == 25
    assert Decimal(str(envelopes["Jedzenie"]["remaining"])) == Decimal("600")
