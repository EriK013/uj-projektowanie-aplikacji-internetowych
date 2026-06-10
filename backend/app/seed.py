from decimal import Decimal

from app.database.session import SessionLocal
from app.models import Category, Envelope, Month, User
from app.security import hash_password

DEMO_EMAIL = "demo@demo.pl"
DEMO_PASSWORD = "demo123"

KATEGORIE = [
    ("Wyplata", "income"),
    ("Stypendium", "income"),
    ("Czynsz", "expense"),
    ("Jedzenie", "expense"),
    ("Transport", "expense"),
    ("Rozrywka", "expense"),
]

MIESIACE = [
    {
        "period": "2026-04",
        "opening_balance": "2239.00",
        "koperty": [
            ("Wyplata", "3800.00", "3807.50"),
            ("Stypendium", "900.00", "930.00"),
            ("Czynsz", "1500.00", "1500.00"),
            ("Jedzenie", "800.00", "612.00"),
            ("Transport", "250.00", "180.00"),
            ("Rozrywka", "300.00", "410.00"),
        ],
    },
    {
        "period": "2026-05",
        "opening_balance": "2400.00",
        "koperty": [
            ("Wyplata", "3800.00", "0.00"),
            ("Czynsz", "1500.00", "1500.00"),
            ("Jedzenie", "800.00", "215.00"),
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        istniejacy = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if istniejacy is not None:
            db.delete(istniejacy)
            db.commit()

        user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
        db.add(user)
        db.flush()

        kategorie = {}
        for nazwa, kind in KATEGORIE:
            cat = Category(user_id=user.id, name=nazwa, kind=kind)
            db.add(cat)
            kategorie[nazwa] = cat
        db.flush()

        for m in MIESIACE:
            month = Month(
                user_id=user.id,
                period=m["period"],
                opening_balance=Decimal(m["opening_balance"]),
            )
            db.add(month)
            db.flush()

            for nazwa, planned, spent in m["koperty"]:
                db.add(
                    Envelope(
                        month_id=month.id,
                        category_id=kategorie[nazwa].id,
                        planned=Decimal(planned),
                        spent=Decimal(spent),
                    )
                )

        db.commit()
        print(f"Seed gotowy: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
