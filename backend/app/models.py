from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Debt(Base):
    __tablename__ = "debts"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "credit_card" | "mortgage"
    balance = Column(Float, nullable=False)
    apr = Column(Float, nullable=False)
    min_payment = Column(Float, nullable=False)
    remaining_months = Column(Integer, nullable=True)
    is_high_interest = Column(Boolean, default=False, nullable=False)
    is_good_debt = Column(Boolean, default=False, nullable=False)


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    tagline = Column(String, nullable=False)
    pros = Column(JSON, nullable=False)
    cons = Column(JSON, nullable=False)
    assumption_apr = Column(Float, nullable=True)
    assumption_term_months = Column(Integer, nullable=True)
    assumption_extra_payment = Column(Float, nullable=True)
    assumption_fee_pct = Column(Float, nullable=True)
    recommended = Column(Boolean, default=False, nullable=False)
    recommended_reason = Column(Text, nullable=True)
    requires_new_credit = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    steps = relationship(
        "PlanStep",
        back_populates="plan",
        order_by="PlanStep.sort_order",
        cascade="all, delete-orphan",
    )


class PlanStep(Base):
    __tablename__ = "plan_steps"

    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("plans.id"), nullable=False)
    parent_id = Column(String, ForeignKey("plan_steps.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)

    plan = relationship("Plan", back_populates="steps")
    parent = relationship("PlanStep", back_populates="substeps", remote_side=[id])
    substeps = relationship(
        "PlanStep",
        back_populates="parent",
        order_by="PlanStep.sort_order",
        cascade="all, delete-orphan",
    )
