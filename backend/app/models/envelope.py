from sqlalchemy import Column, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import Base


class Envelope(Base):
    __tablename__ = "envelopes"

    id = Column(Integer, primary_key=True)
    month_id = Column(Integer, ForeignKey("months.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    planned = Column(Numeric(10, 2), nullable=False, default=0)
    spent = Column(Numeric(10, 2), nullable=False, default=0)

    month = relationship("Month", back_populates="envelopes")
    category = relationship("Category", back_populates="envelopes")

    __table_args__ = (
        UniqueConstraint("month_id", "category_id", name="uq_envelope_month_category"),
    )
