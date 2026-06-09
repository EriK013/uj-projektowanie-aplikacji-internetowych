from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    categories = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    months = relationship(
        "Month", back_populates="user", cascade="all, delete-orphan"
    )
