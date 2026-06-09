import re
from decimal import Decimal

from pydantic import BaseModel, Field, computed_field, field_serializer, field_validator

MIESIACE = [
    "Styczen", "Luty", "Marzec", "Kwiecien", "Maj", "Czerwiec",
    "Lipiec", "Sierpien", "Wrzesien", "Pazdziernik", "Listopad", "Grudzien",
]

_WZORZEC = re.compile(r"^\d{2}-\d{4}$")  # MM-RRRR


class MonthCreate(BaseModel):
    period: str
    opening_balance: Decimal = Field(default=Decimal("0"), ge=0)

    @field_validator("period")
    @classmethod
    def _period(cls, v: str) -> str:
        if not _WZORZEC.match(v):
            raise ValueError("period musi byc w formacie MM-RRRR")
        mm, rok = v.split("-")
        if not 1 <= int(mm) <= 12:
            raise ValueError("miesiac musi byc w zakresie 01-12")
        return f"{rok}-{mm}"  


class MonthRead(BaseModel):
    id: int
    period: str
    opening_balance: Decimal

    model_config = {"from_attributes": True}

    @field_serializer("period")
    def _period_out(self, v: str) -> str:
        rok, mm = v.split("-")
        return f"{mm}-{rok}"

    @computed_field
    @property
    def label(self) -> str:
        rok, mm = self.period.split("-")
        return f"{MIESIACE[int(mm) - 1]} {rok}"
