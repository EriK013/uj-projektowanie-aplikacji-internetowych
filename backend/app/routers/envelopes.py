from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database.session import get_db
from app.schemas.envelope import EnvelopeCreate, EnvelopeRead, EnvelopeUpdate
from app.security import get_current_user

router = APIRouter(prefix="/envelopes", tags=["envelopes"])


@router.post("", response_model=EnvelopeRead, status_code=status.HTTP_201_CREATED)
def create_envelope(
    data: EnvelopeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    month = db.get(models.Month, data.month_id)
    if month is None or month.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Miesiac nie istnieje")

    category = db.get(models.Category, data.category_id)
    if category is None or category.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kategoria nie istnieje")

    duplikat = (
        db.query(models.Envelope)
        .filter(
            models.Envelope.month_id == data.month_id,
            models.Envelope.category_id == data.category_id,
        )
        .first()
    )
    if duplikat is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Koperta dla tej kategorii w tym miesiacu juz istnieje",
        )

    envelope = models.Envelope(
        month_id=data.month_id,
        category_id=data.category_id,
        planned=data.planned,
        spent=data.spent,
    )
    db.add(envelope)
    db.commit()
    db.refresh(envelope)
    return envelope


@router.put("/{envelope_id}", response_model=EnvelopeRead)
def update_envelope(
    envelope_id: int,
    data: EnvelopeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    envelope = _get_owned(db, envelope_id, current_user.id)
    if data.planned is not None:
        envelope.planned = data.planned
    if data.spent is not None:
        envelope.spent = data.spent
    db.commit()
    db.refresh(envelope)
    return envelope


@router.delete("/{envelope_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_envelope(
    envelope_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    envelope = _get_owned(db, envelope_id, current_user.id)
    db.delete(envelope)
    db.commit()


def _get_owned(db: Session, envelope_id: int, user_id: int) -> models.Envelope:
    envelope = db.get(models.Envelope, envelope_id)
    if envelope is None or envelope.month.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Koperta nie istnieje")
    return envelope
