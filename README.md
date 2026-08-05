# Nathan Hills — Debt Payoff Planner

A financial planning app for paying down debt faster. It surfaces insights from
your (mocked) connected accounts, lets you interactively explore how
consolidating your debt would change your payoff timeline, and turns the plan
you pick into a concrete checklist you can track to completion.

## What it does

- **Insights** — flags high-interest credit card debt and separately calls out
  "good debt" (a mortgage) that doesn't need action.
- **Interactive comparison** — drag interest rate and monthly payment sliders
  to see a live line chart of your current payoff path vs. a new consolidated
  one, with the time and interest saved.
- **Recommended plans** — three ways to pay it off (personal loan
  consolidation, balance transfer, DIY debt avalanche), each with real
  computed numbers and pros/cons. The best fit is flagged with a badge and a
  plain-language reason.
- **Plan detail** — tapping a plan shows its full payoff breakdown, a progress
  meter, and a step-by-step checklist (with substeps) you can check off as you
  go.

## Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite — owns the account/plan data and
  the amortization math used to score and rank the plans.
- **Frontend**: React, TypeScript, Vite — mirrors the amortization math in
  `src/lib/amortization.ts` so the comparison chart updates instantly as you
  drag, with no round trip per slider move.

## Project structure

```
backend/
  app/
    finance.py     amortization + payoff simulation (avalanche, fixed-payment, balance transfer)
    planning.py    turns raw debts + a plan's assumptions into computed outcomes
    models.py      Debt, Plan, PlanStep (self-referential for substeps)
    seed.py        mock account + plan data
    main.py        API routes
frontend/
  src/
    lib/amortization.ts   client-side mirror of finance.py for live chart updates
    components/            chart, sliders, cards, steps, stat tiles
    pages/                 Overview (insights + comparison + plans), PlanDetail
```

## Running locally

You'll need two terminals — one for the backend, one for the frontend.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. A SQLite database file (`app.db`) is
seeded with mock accounts and plans on first run. Interactive API docs are
available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the
backend.

## API

| Method | Path                                | Description                                    |
| ------ | ----------------------------------- | ----------------------------------------------- |
| GET    | `/api/health`                       | Health check                                    |
| GET    | `/api/debts`                        | Connected accounts + high-interest/good-debt summaries |
| GET    | `/api/plans`                        | The 3 payoff plans with computed outcomes       |
| GET    | `/api/plans/{id}`                   | Full plan detail: schedule, progress, steps     |
| PATCH  | `/api/plans/{id}/steps/{step_id}`   | Toggle a step or substep complete               |

## Next steps

This is a working prototype on mock data, not a finished product. Natural next
steps:

- Replace the mocked `/api/debts` with a real account-aggregation integration
- Add authentication and per-user accounts
- Replace SQLite with Postgres for production use
- Add tests (`pytest` for the backend, `vitest`/React Testing Library for the frontend)
