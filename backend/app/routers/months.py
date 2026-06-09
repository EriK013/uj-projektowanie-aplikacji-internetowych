from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database.session import get_db
from app.schemas.month import MonthCreate, MonthRead
from app.schemas.summary import MonthSummary, SummaryEnvelope, SummaryTotals
from app.security import get_current_user

router = APIRouter(prefix="/months", tags=["months"])


@router.get("", response_model=list[MonthRead])
def list_months(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Month)
        .filter(models.Month.user_id == current_user.id)
        .order_by(models.Month.period.desc())
        .all()
    )


@router.post("", response_model=MonthRead, status_code=status.HTTP_201_CREATED)
def create_month(
    data: MonthCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    exists = (
        db.query(models.Month)
        .filter(
            models.Month.user_id == current_user.id,
            models.Month.period == data.period,
        )
        .first()
    )
    if exists is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ten miesiac juz istnieje")

    month = models.Month(
        user_id=current_user.id,
        period=data.period,
        opening_balance=data.opening_balance,
    )
    db.add(month)
    db.commit()
    db.refresh(month)
    return month


@router.get("/{month_id}", response_model=MonthRead)
def get_month(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_owned(db, month_id, current_user.id)


@router.get("/{month_id}/summary", response_model=MonthSummary)
def month_summary(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    month = _get_owned(db, month_id, current_user.id)

    rows = (
        db.query(models.Envelope, models.Category)
        .join(models.Category, models.Envelope.category_id == models.Category.id)
        .filter(models.Envelope.month_id == month.id)
        .all()
    )

    planned_income = spent_income = Decimal("0")
    planned_expense = spent_expense = Decimal("0")
    envelopes: list[SummaryEnvelope] = []

    for envelope, category in rows:
        if category.kind == "income":
            planned_income += envelope.planned
            spent_income += envelope.spent
        else:
            planned_expense += envelope.planned
            spent_expense += envelope.spent

        pct = int(envelope.spent / envelope.planned * 100) if envelope.planned else 0
        envelopes.append(
            SummaryEnvelope(
                id=envelope.id,
                name=category.name,
                kind=category.kind,
                planned=envelope.planned,
                spent=envelope.spent,
                remaining=envelope.planned - envelope.spent,
                pct=pct,
            )
        )

    totals = SummaryTotals(
        planned_income=planned_income,
        spent_income=spent_income,
        planned_expense=planned_expense,
        spent_expense=spent_expense,
        current_balance=month.opening_balance + spent_income - spent_expense,
        predicted_balance=month.opening_balance + planned_income - planned_expense,
        unallocated=planned_income - planned_expense,
    )

    return MonthSummary(month=month, totals=totals, envelopes=envelopes)


@router.delete("/{month_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_month(
    month_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    month = _get_owned(db, month_id, current_user.id)
    db.delete(month)
    db.commit()


def _get_owned(db: Session, month_id: int, user_id: int) -> models.Month:
    month = db.get(models.Month, month_id)
    if month is None or month.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Miesiac nie istnieje")
    return month
