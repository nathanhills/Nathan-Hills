from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class DebtOut(CamelModel):
    id: str
    name: str
    type: str
    balance: float
    apr: float
    min_payment: float
    remaining_months: int | None = None
    is_high_interest: bool
    is_good_debt: bool


class HighInterestSummary(CamelModel):
    count: int
    total_balance: float
    avg_apr: float
    total_min_payment: float
    baseline_months: int
    baseline_total_interest: float


class GoodDebtSummary(CamelModel):
    total_balance: float
    apr: float
    monthly_payment: float
    remaining_months: int


class DebtsResponse(CamelModel):
    debts: list[DebtOut]
    high_interest_summary: HighInterestSummary
    good_debt_summary: GoodDebtSummary


class PlanOut(CamelModel):
    id: str
    type: str
    name: str
    tagline: str
    pros: list[str]
    cons: list[str]
    recommended: bool
    recommended_reason: str | None = None
    monthly_payment: float
    months: int
    total_cost: float
    interest_saved: float
    months_saved: int
    requires_new_credit: bool


class PlanStepOut(CamelModel):
    id: str
    title: str
    description: str | None = None
    completed: bool
    substeps: list["PlanStepOut"] = []


class PlanDetailOut(PlanOut):
    schedule: list[float]
    baseline_schedule: list[float]
    progress_percent: float
    steps: list[PlanStepOut]


class StepUpdate(CamelModel):
    completed: bool
