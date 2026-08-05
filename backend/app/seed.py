from sqlalchemy.orm import Session

from . import models

DEBTS = [
    dict(
        id="cc-1",
        name="Chase Sapphire Preferred",
        type="credit_card",
        balance=4200.00,
        apr=24.99,
        min_payment=126.00,
        is_high_interest=True,
    ),
    dict(
        id="cc-2",
        name="Capital One Quicksilver",
        type="credit_card",
        balance=2800.00,
        apr=26.99,
        min_payment=84.00,
        is_high_interest=True,
    ),
    dict(
        id="cc-3",
        name="Discover it",
        type="credit_card",
        balance=3600.00,
        apr=22.49,
        min_payment=108.00,
        is_high_interest=True,
    ),
    dict(
        id="mortgage-1",
        name="Home Mortgage",
        type="mortgage",
        balance=285000.00,
        apr=6.25,
        min_payment=1850.25,
        remaining_months=312,
        is_good_debt=True,
    ),
]

PLANS = [
    dict(
        id="personal-loan",
        type="personal_loan",
        name="Personal Loan Consolidation",
        tagline="Roll all three cards into one fixed-rate loan.",
        pros=[
            "One fixed payment instead of three",
            "Rate drops from ~25% to about 14.5%",
            "Fixed 3-year payoff date — you know exactly when you're done",
            "No dependency on a promotional window",
        ],
        cons=[
            "Requires a credit check and approval",
            "Payment rises from $318 to about $365/mo",
            "Closing the cards can affect your credit mix",
        ],
        assumption_apr=14.5,
        assumption_term_months=36,
        recommended=True,
        recommended_reason=(
            "The most predictable path: a fixed rate and 3-year timeline, real "
            "savings, and only a small increase in your monthly payment — with no "
            "risk of the rate jumping back up if a deadline is missed."
        ),
        requires_new_credit=True,
        sort_order=1,
        steps=[
            dict(
                title="Apply for a personal loan",
                completed=True,
                substeps=[
                    dict(title="Check your credit score", completed=True),
                    dict(title="Compare lenders and rates", completed=True),
                    dict(title="Submit your application", completed=True),
                    dict(title="Get approved and receive funds", completed=True),
                ],
            ),
            dict(
                title="Pay off your credit cards",
                substeps=[
                    dict(title="Pay off Chase Sapphire Preferred ($4,200)", completed=True),
                    dict(title="Pay off Capital One Quicksilver ($2,800)", completed=True),
                    dict(title="Pay off Discover it ($3,600)", completed=False),
                ],
            ),
            dict(
                title="Make your monthly payments",
                substeps=[
                    dict(title="Set up autopay for the loan payment", completed=False),
                    dict(title="Track your progress each month", completed=False),
                ],
            ),
            dict(
                title="Stay debt-free",
                substeps=[
                    dict(title="Avoid new balances on the old cards", completed=False),
                    dict(title="Redirect the old payments into savings", completed=False),
                ],
            ),
        ],
    ),
    dict(
        id="balance-transfer",
        type="balance_transfer",
        name="Balance Transfer Consolidation",
        tagline="Move your balances to a 0% intro APR card.",
        pros=[
            "0% interest during the intro period",
            "Lowest total cost if paid off in time",
            "Simple to set up online",
        ],
        cons=[
            "Needs excellent credit for a big enough limit",
            "Requires about $607/mo to clear it in 18 months",
            "Any balance left when the intro ends jumps to a high variable APR",
            "Usually a 3-5% transfer fee upfront",
        ],
        assumption_apr=0.0,
        assumption_term_months=18,
        assumption_fee_pct=3.0,
        recommended=False,
        requires_new_credit=True,
        sort_order=2,
        steps=[
            dict(
                title="Open a balance transfer card",
                substeps=[
                    dict(title="Compare 0% intro APR offers", completed=False),
                    dict(title="Apply for the card", completed=False),
                    dict(title="Get approved", completed=False),
                ],
            ),
            dict(
                title="Transfer your balances",
                substeps=[
                    dict(title="Transfer Chase Sapphire Preferred", completed=False),
                    dict(title="Transfer Capital One Quicksilver", completed=False),
                    dict(title="Transfer Discover it", completed=False),
                ],
            ),
            dict(
                title="Pay it off before the intro APR ends",
                substeps=[
                    dict(title="Set up autopay for the full payoff amount", completed=False),
                    dict(title="Track the 18-month deadline", completed=False),
                ],
            ),
            dict(
                title="Stay debt-free",
                substeps=[
                    dict(title="Freeze or close the old cards", completed=False),
                    dict(title="Avoid new charges on the transfer card", completed=False),
                ],
            ),
        ],
    ),
    dict(
        id="avalanche",
        type="avalanche",
        name="Debt Avalanche (DIY)",
        tagline="Keep your cards, attack the highest rate first.",
        pros=[
            "No new credit or applications",
            "Full flexibility to change the plan anytime",
            "No fees",
        ],
        cons=[
            "Rates stay high (22-27%) the whole time",
            "Requires consistently paying $200/mo extra",
            "Easiest plan to fall off of without automation",
        ],
        assumption_extra_payment=200.0,
        recommended=False,
        requires_new_credit=False,
        sort_order=3,
        steps=[
            dict(
                title="Rank your cards by interest rate",
                substeps=[
                    dict(title="List all three cards from highest to lowest APR", completed=False),
                ],
            ),
            dict(
                title="Automate minimums on the other two",
                substeps=[
                    dict(title="Automate the minimum on Chase Sapphire Preferred", completed=False),
                    dict(title="Automate the minimum on Discover it", completed=False),
                ],
            ),
            dict(
                title="Attack Capital One Quicksilver with $200 extra",
                substeps=[
                    dict(title="Add $200/mo extra to Capital One Quicksilver", completed=False),
                    dict(title="Confirm it's paid off", completed=False),
                ],
            ),
            dict(
                title="Roll the payment to the next card",
                substeps=[
                    dict(title="Move the freed-up payment to Chase Sapphire Preferred", completed=False),
                    dict(title="Repeat until every card is at $0", completed=False),
                ],
            ),
        ],
    ),
]


def seed(db: Session) -> None:
    if db.query(models.Debt).first() is None:
        for debt in DEBTS:
            db.add(models.Debt(**debt))

    if db.query(models.Plan).first() is None:
        for plan_data in PLANS:
            steps = plan_data.pop("steps")
            plan = models.Plan(**plan_data)
            db.add(plan)
            for step_order, step_data in enumerate(steps):
                substeps = step_data.pop("substeps", [])
                step_id = f"{plan.id}-step-{step_order + 1}"
                step = models.PlanStep(
                    id=step_id,
                    plan_id=plan.id,
                    sort_order=step_order,
                    **step_data,
                )
                db.add(step)
                for sub_order, sub_data in enumerate(substeps):
                    db.add(
                        models.PlanStep(
                            id=f"{step_id}-sub-{sub_order + 1}",
                            plan_id=plan.id,
                            parent_id=step_id,
                            sort_order=sub_order,
                            **sub_data,
                        )
                    )

    db.commit()
