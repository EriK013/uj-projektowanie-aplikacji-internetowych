from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database.session import get_db
from app.schemas.month import MonthCreate, MonthRead
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
