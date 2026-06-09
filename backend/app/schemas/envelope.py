from decimal import Decimal

from pydantic import BaseModel, Field


class EnvelopeCreate(BaseModel):
    month_id: int
    category_id: int
    planned: Decimal = Field(default=Decimal("0"), ge=0)
    spent: Decimal = Field(default=Decimal("0"), ge=0)


class EnvelopeUpdate(BaseModel):
    planned: Decimal | None = Field(default=None, ge=0)
    spent: Decimal | None = Field(default=None, ge=0)


class EnvelopeRead(BaseModel):
    id: int
    month_id: int
    category_id: int
    planned: Decimal
    spent: Decimal

    model_config = {"from_attributes": True}
