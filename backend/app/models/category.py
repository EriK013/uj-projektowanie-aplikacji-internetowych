from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False)  # income | expense

    user = relationship("User", back_populates="categories")
    envelopes = relationship(
        "Envelope", back_populates="category", cascade="all, delete-orphan"
    )
