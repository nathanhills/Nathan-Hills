from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, planning, schemas
from .database import Base, SessionLocal, engine, get_db
from .seed import seed

Base.metadata.create_all(bind=engine)

with SessionLocal() as _seed_db:
    seed(_seed_db)

app = FastAPI(title="Debt Payoff Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/debts", response_model=schemas.DebtsResponse)
def get_debts(db: Session = Depends(get_db)):
    debts = db.query(models.Debt).all()
    cards = [d for d in debts if d.type == "credit_card"]
    mortgage = next(d for d in debts if d.type == "mortgage")
    return {
        "debts": debts,
        "high_interest_summary": planning.high_interest_summary(cards),
        "good_debt_summary": planning.good_debt_summary(mortgage),
    }


def _plan_out(plan: models.Plan, cards: list[models.Debt]) -> dict:
    outcome = planning.compute_plan_outcome(plan, cards)
    return {
        "id": plan.id,
        "type": plan.type,
        "name": plan.name,
        "tagline": plan.tagline,
        "pros": plan.pros,
        "cons": plan.cons,
        "recommended": plan.recommended,
        "recommended_reason": plan.recommended_reason,
        "requires_new_credit": plan.requires_new_credit,
        "monthly_payment": outcome["monthly_payment"],
        "months": outcome["months"],
        "total_cost": outcome["total_cost"],
        "interest_saved": outcome["interest_saved"],
        "months_saved": outcome["months_saved"],
    }


@app.get("/api/plans", response_model=list[schemas.PlanOut])
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(models.Plan).order_by(models.Plan.sort_order).all()
    cards = db.query(models.Debt).filter(models.Debt.type == "credit_card").all()
    return [_plan_out(p, cards) for p in plans]


@app.get("/api/plans/{plan_id}", response_model=schemas.PlanDetailOut)
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.get(models.Plan, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    cards = db.query(models.Debt).filter(models.Debt.type == "credit_card").all()
    outcome = planning.compute_plan_outcome(plan, cards)
    base = _plan_out(plan, cards)
    return {
        **base,
        "schedule": outcome["schedule"],
        "baseline_schedule": outcome["baseline_schedule"],
        "progress_percent": planning.compute_progress_percent(plan.steps),
        "steps": planning.build_step_tree(plan),
    }


@app.patch("/api/plans/{plan_id}/steps/{step_id}", response_model=schemas.PlanDetailOut)
def update_step(plan_id: str, step_id: str, patch: schemas.StepUpdate, db: Session = Depends(get_db)):
    plan = db.get(models.Plan, plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    step = db.get(models.PlanStep, step_id)
    if step is None or step.plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Step not found")

    def cascade(s: models.PlanStep, completed: bool):
        s.completed = completed
        for sub in s.substeps:
            cascade(sub, completed)

    cascade(step, patch.completed)
    db.commit()

    cards = db.query(models.Debt).filter(models.Debt.type == "credit_card").all()
    outcome = planning.compute_plan_outcome(plan, cards)
    base = _plan_out(plan, cards)
    return {
        **base,
        "schedule": outcome["schedule"],
        "baseline_schedule": outcome["baseline_schedule"],
        "progress_percent": planning.compute_progress_percent(plan.steps),
        "steps": planning.build_step_tree(plan),
    }
