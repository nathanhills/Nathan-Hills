from . import finance, models


def debt_to_dict(debt: models.Debt) -> dict:
    return {"balance": debt.balance, "apr": debt.apr, "min_payment": debt.min_payment}


def high_interest_summary(cards: list[models.Debt]) -> dict:
    total_balance = sum(c.balance for c in cards)
    total_min_payment = sum(c.min_payment for c in cards)
    avg_apr = sum(c.balance * c.apr for c in cards) / total_balance
    baseline = finance.combined_baseline([debt_to_dict(c) for c in cards])
    return {
        "count": len(cards),
        "total_balance": round(total_balance, 2),
        "avg_apr": round(avg_apr, 2),
        "total_min_payment": round(total_min_payment, 2),
        "baseline_months": baseline["months"],
        "baseline_total_interest": baseline["total_interest"],
    }


def good_debt_summary(mortgage: models.Debt) -> dict:
    return {
        "total_balance": mortgage.balance,
        "apr": mortgage.apr,
        "monthly_payment": mortgage.min_payment,
        "remaining_months": mortgage.remaining_months,
    }


def compute_plan_outcome(plan: models.Plan, cards: list[models.Debt]) -> dict:
    total_balance = sum(c.balance for c in cards)
    baseline = finance.combined_baseline([debt_to_dict(c) for c in cards])

    if plan.type == "personal_loan":
        payment = finance.amortized_payment(total_balance, plan.assumption_apr, plan.assumption_term_months)
        sim = finance.simulate_fixed_payment(total_balance, plan.assumption_apr, payment)
        months, total_cost, schedule = sim["months"], sim["total_interest"], sim["schedule"]
    elif plan.type == "balance_transfer":
        sim = finance.simulate_balance_transfer(total_balance, plan.assumption_fee_pct, plan.assumption_term_months)
        payment, months, total_cost, schedule = sim["payment"], sim["months"], sim["total_interest"], sim["schedule"]
    elif plan.type == "avalanche":
        sim = finance.simulate_avalanche([debt_to_dict(c) for c in cards], plan.assumption_extra_payment)
        months, total_cost, schedule = sim["months"], sim["total_interest"], sim["schedule"]
        payment = sum(c.min_payment for c in cards) + plan.assumption_extra_payment
    else:
        raise ValueError(f"Unknown plan type: {plan.type}")

    return {
        "monthly_payment": round(payment, 2),
        "months": months,
        "total_cost": round(total_cost, 2),
        "interest_saved": round(baseline["total_interest"] - total_cost, 2),
        "months_saved": baseline["months"] - months,
        "schedule": schedule,
        "baseline_schedule": baseline["schedule"],
    }


def compute_progress_percent(steps: list[models.PlanStep]) -> float:
    leaves = [s for s in steps if len(s.substeps) == 0]
    if not leaves:
        return 0.0
    completed = sum(1 for s in leaves if s.completed)
    return round(completed / len(leaves) * 100, 1)


def step_to_tree(step: models.PlanStep) -> dict:
    substeps = [step_to_tree(s) for s in sorted(step.substeps, key=lambda s: s.sort_order)]
    completed = step.completed if not substeps else all(s["completed"] for s in substeps)
    return {
        "id": step.id,
        "title": step.title,
        "description": step.description,
        "completed": completed,
        "substeps": substeps,
    }


def build_step_tree(plan: models.Plan) -> list[dict]:
    top_level = sorted((s for s in plan.steps if s.parent_id is None), key=lambda s: s.sort_order)
    return [step_to_tree(s) for s in top_level]
