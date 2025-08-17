# Repository Guidelines

## Project Structure & Module Organization
- Root: `frontend/` (Next.js + TypeScript + Tailwind CSS 4), `backend/` (FastAPI + SQLite).
- Frontend:
  - App routes: `frontend/src/app/*`
  - UI: `frontend/src/components/*`, utilities: `frontend/src/lib/*`, styles: `frontend/src/app/globals.css` and `frontend/src/styles/*`, assets: `frontend/public/*`.
- Backend:
  - API entry: `backend/main.py`, auth/user routes: `backend/user.py`, DB: `backend/music.db`, deps: `backend/requirements.txt`.

## Build, Test, and Development Commands
- Frontend (recommended pnpm):
  - `pnpm dev` (or `npm run dev`): start Next.js dev server.
  - `pnpm build` (or `npm run build`): production build.
  - `pnpm lint` (or `npm run lint`): run ESLint.
- Backend (Python):
  - Install deps: `pip install -r backend/requirements.txt`.
  - Run API (dev): `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`.

## Coding Style & Naming Conventions
- TypeScript + React function components; prefer hooks and composition.
- File names: kebab-case (e.g., `lyrics-display.tsx`, `player-layout.tsx`).
- Indentation: 2 spaces; keep imports sorted logically.
- Tailwind: utility-first; prefer conditional classes via `cn` from `frontend/src/lib/utils`.
- Linting: ESLint (Next.js config). Run `pnpm lint` before commits.
- Python: Pydantic models for schemas; keep endpoints in small, focused routers.

## Testing Guidelines
- No formal unit test suite configured. Validate changes by:
  - Frontend: run locally, verify key flows (Play page, lyrics, playlist) and check console for errors.
  - Backend: use `curl`/REST client to hit endpoints; ensure SQLite changes persist.
- Add tests if introducing complex logic (co-locate or `__tests__` for TS; pytest for Python if added).

## Commit & Pull Request Guidelines
- Commits: concise imperative subject; include scope when helpful (e.g., `frontend: clamp lyrics on mobile`).
- PRs: include description, rationale, screenshots or terminal output, and test steps. Link related issues.
- Ensure: builds pass, `pnpm lint` clean, and API runs locally.

## Security & Configuration Tips
- Do not commit secrets. Backend `SECRET_KEY` must be provided via environment in production.
- Validate uploads and sanitize user input. Lock CORS in production to trusted origins.
