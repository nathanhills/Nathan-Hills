# Nathan Hills

A full-stack starter: FastAPI backend + React (Vite, TypeScript) frontend, wired together with a working example — a small task list — so add/list/complete/delete all round-trip through a real API and database.

## Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, TypeScript, Vite

## Project structure

```
backend/    FastAPI app (app/main.py, models, schemas, SQLite database)
frontend/   React + Vite app (src/App.tsx)
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

The API runs at `http://localhost:8000`. A SQLite database file (`app.db`) is created automatically on first run. Interactive API docs are available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend.

## API

| Method | Path              | Description        |
| ------ | ----------------- | ------------------- |
| GET    | `/api/health`     | Health check         |
| GET    | `/api/tasks`      | List tasks           |
| POST   | `/api/tasks`      | Create a task         |
| PATCH  | `/api/tasks/{id}` | Update a task         |
| DELETE | `/api/tasks/{id}` | Delete a task         |

## Next steps

This is a starting point, not a finished product. Some natural next steps depending on where you take it:

- Swap the task list for your actual domain model
- Add authentication if the app needs user accounts
- Replace SQLite with Postgres for production use
- Add tests (`pytest` for the backend, `vitest`/`React Testing Library` for the frontend)
