from decimal import Decimal

from pydantic import BaseModel

from app.schemas.month import MonthRead


class SummaryTotals(BaseModel):
    planned_income: Decimal
    spent_income: Decimal
    planned_expense: Decimal
    spent_expense: Decimal
    current_balance: Decimal
    predicted_balance: Decimal
    unallocated: Decimal


class SummaryEnvelope(BaseModel):
    id: int
    name: str
    kind: str
    planned: Decimal
    spent: Decimal
    remaining: Decimal
    pct: int


class MonthSummary(BaseModel):
    month: MonthRead
    totals: SummaryTotals
    envelopes: list[SummaryEnvelope]
