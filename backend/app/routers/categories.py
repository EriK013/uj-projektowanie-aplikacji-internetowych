from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models
from app.database.session import get_db
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.security import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Category)
        .filter(models.Category.user_id == current_user.id)
        .order_by(models.Category.id)
        .all()
    )


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    category = models.Category(
        user_id=current_user.id, name=data.name, kind=data.kind
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    category = _get_owned(db, category_id, current_user.id)
    category.name = data.name
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    category = _get_owned(db, category_id, current_user.id)

    used = (
        db.query(models.Envelope)
        .filter(models.Envelope.category_id == category.id)
        .first()
    )
    if used is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Kategoria jest uzywana w kopertach i nie moze byc usunieta",
        )

    db.delete(category)
    db.commit()


def _get_owned(db: Session, category_id: int, user_id: int) -> models.Category:
    category = db.get(models.Category, category_id)
    if category is None or category.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kategoria nie istnieje")
    return category
