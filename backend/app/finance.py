"""Debt payoff math: amortization, fixed-payment simulation, and avalanche allocation.

All money is float dollars, all rates are annual percentages (e.g. 24.99), all
time is whole months. Simulations run month-by-month rather than using closed-form
solutions so callers get a full balance schedule (for charting) alongside the
totals, and so the final month's partial payment is handled correctly.
"""

import math

MAX_MONTHS = 600


def monthly_rate(apr: float) -> float:
    return apr / 100 / 12


def amortized_payment(balance: float, apr: float, months: int) -> float:
    """Standard fixed-rate loan payment for a given principal, rate, and term."""
    r = monthly_rate(apr)
    if r == 0:
        return balance / months
    return balance * r / (1 - (1 + r) ** -months)


def months_to_payoff(balance: float, apr: float, payment: float) -> float | None:
    """Solve for the number of months a fixed payment takes to clear a balance.

    Returns None if the payment never covers accruing interest.
    """
    r = monthly_rate(apr)
    if r == 0:
        return balance / payment
    if payment <= balance * r:
        return None
    return -math.log(1 - (r * balance) / payment) / math.log(1 + r)


def simulate_fixed_payment(balance: float, apr: float, payment: float) -> dict:
    """Amortize a single balance at a fixed payment until it hits zero."""
    r = monthly_rate(apr)
    schedule = [round(balance, 2)]
    total_interest = 0.0
    bal = balance
    months = 0
    while bal > 0.005 and months < MAX_MONTHS:
        interest = bal * r
        principal = payment - interest
        if principal <= 0:
            # Payment doesn't cover interest; balance never shrinks.
            return {"months": None, "total_interest": None, "schedule": schedule}
        bal = max(0.0, bal - principal)
        total_interest += interest
        months += 1
        schedule.append(round(bal, 2))
    return {"months": months, "total_interest": round(total_interest, 2), "schedule": schedule}


def combined_baseline(debts: list[dict]) -> dict:
    """Sum independent fixed-minimum-payment payoffs across several debts.

    This models "change nothing, just keep paying the minimum shown today" -
    each debt amortizes on its own with no reallocation between them.
    """
    sims = [simulate_fixed_payment(d["balance"], d["apr"], d["min_payment"]) for d in debts]
    max_len = max(len(s["schedule"]) for s in sims)
    combined_schedule = []
    for i in range(max_len):
        total = 0.0
        for s in sims:
            total += s["schedule"][i] if i < len(s["schedule"]) else 0.0
        combined_schedule.append(round(total, 2))
    return {
        "months": max(s["months"] for s in sims),
        "total_interest": round(sum(s["total_interest"] for s in sims), 2),
        "schedule": combined_schedule,
    }


def simulate_avalanche(debts: list[dict], extra_payment: float) -> dict:
    """Pay minimums on every debt; extra goes to the highest-APR balance.

    When a debt is paid off, its minimum payment rolls into the pool of
    "extra" money applied to the next highest-APR debt (the classic avalanche
    rollover).
    """
    state = [dict(d) for d in debts]
    months = 0
    total_interest = 0.0
    combined_schedule = [round(sum(d["balance"] for d in state), 2)]

    while any(d["balance"] > 0.005 for d in state) and months < MAX_MONTHS:
        active = [d for d in state if d["balance"] > 0.005]
        freed_minimums = sum(d["min_payment"] for d in state if d["balance"] <= 0.005)
        pool_extra = extra_payment + freed_minimums
        active_by_apr = sorted(active, key=lambda d: -d["apr"])

        for i, d in enumerate(active_by_apr):
            r = monthly_rate(d["apr"])
            interest = d["balance"] * r
            total_interest += interest
            payment = d["min_payment"] + (pool_extra if i == 0 else 0)
            principal = payment - interest
            d["balance"] = max(0.0, d["balance"] - principal)

        months += 1
        combined_schedule.append(round(sum(d["balance"] for d in state), 2))

    return {
        "months": months,
        "total_interest": round(total_interest, 2),
        "schedule": combined_schedule,
    }


def simulate_balance_transfer(balance: float, fee_pct: float, term_months: int) -> dict:
    """0% intro APR for the transfer term; the fee is the only cost, assuming
    the balance is paid off before the intro period ends."""
    fee = balance * fee_pct / 100
    adjusted = balance + fee
    payment = adjusted / term_months
    step = adjusted / term_months
    schedule = [round(adjusted - step * i, 2) for i in range(term_months + 1)]
    schedule[-1] = 0.0
    return {
        "months": term_months,
        "total_interest": round(fee, 2),
        "schedule": schedule,
        "payment": round(payment, 2),
        "fee": round(fee, 2),
    }
