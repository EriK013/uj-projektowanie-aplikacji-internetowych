from typing import Literal

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    kind: Literal["income", "expense"]


class CategoryUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class CategoryRead(BaseModel):
    id: int
    name: str
    kind: str

    model_config = {"from_attributes": True}
