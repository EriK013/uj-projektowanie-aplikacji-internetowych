from datetime import datetime, timezone

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import models
from app.config import CORS_ORIGINS
from app.database.session import get_db
from app.routers import auth, categories, envelopes, months

app = FastAPI(title="BudzetApp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(months.router)
app.include_router(envelopes.router)


@app.get("/health")
def health():
    return {"status": "ok"}

# DEBUG ENDPOINTS
@app.get("/debug/db")
def debug_db(db: Session = Depends(get_db)):
    return {
        "users": db.query(models.User).count(),
        "categories": db.query(models.Category).count(),
        "months": db.query(models.Month).count(),
        "envelopes": db.query(models.Envelope).count(),
    }


@app.post("/debug/seed")
def debug_seed(db: Session = Depends(get_db)):
    stamp = int(datetime.now(timezone.utc).timestamp())

    user = models.User(email=f"debug-{stamp}@example.com", password_hash="x")
    db.add(user)
    db.flush()

    category = models.Category(user_id=user.id, name="Jedzenie", kind="expense")
    month = models.Month(user_id=user.id, period="2026-06", opening_balance=1000)
    db.add_all([category, month])
    db.flush()

    envelope = models.Envelope(
        month_id=month.id, category_id=category.id, planned=500, spent=120
    )
    db.add(envelope)
    db.commit()

    return {
        "user_id": user.id,
        "category_id": category.id,
        "month_id": month.id,
        "envelope": {
            "id": envelope.id,
            "planned": str(envelope.planned),
            "spent": str(envelope.spent),
        },
    }
