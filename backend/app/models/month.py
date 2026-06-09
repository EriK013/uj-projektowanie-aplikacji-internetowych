from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import Base


class Month(Base):
    __tablename__ = "months"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period = Column(String, nullable=False)  # RRRR-MM
    opening_balance = Column(Numeric(10, 2), nullable=False, default=0)

    user = relationship("User", back_populates="months")
    envelopes = relationship(
        "Envelope", back_populates="month", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "period", name="uq_month_user_period"),
    )
