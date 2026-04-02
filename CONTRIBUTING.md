# Contributing to VerifyAI

Thanks for your interest in contributing! This guide will help you get set up and make your first contribution.

---

## Development Setup

### Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **PostgreSQL** 15+ (or Docker)
- **Git**

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/fake-news-detector_AI.git
cd fake-news-detector_AI
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database URL and API keys
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL and OAuth credentials
npm run dev
```

### 4. Database (Docker)

```bash
docker-compose up -d db
```

---

## Project Structure

```
backend/app/services/   — Core analysis pipeline (classifier, sentiment, etc.)
backend/app/routers/    — API endpoint definitions
frontend/src/app/       — Next.js pages (App Router)
frontend/src/components — React components
notebooks/              — Jupyter notebooks for model training
extension/              — Chrome extension (Manifest V3)
```

---

## Making Changes

### Branch Naming

- `feature/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation updates

### Workflow

1. Create a branch from `main`
2. Make your changes
3. Test locally (backend + frontend)
4. Commit with a clear message
5. Push and open a Pull Request

### Commit Messages

Use concise, descriptive messages:

```
Add clickbait score to analysis results
Fix sentiment scoring for short texts
Update API docs with new endpoints
```

---

## Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints for function signatures
- Add docstrings to public functions
- Use `async/await` for I/O-bound operations

### TypeScript (Frontend)

- Use TypeScript for all new files
- Follow existing component patterns (functional components + hooks)
- Use Tailwind CSS for styling (no inline styles or CSS modules)

---

## API Changes

If you modify or add API endpoints:

1. Update Pydantic schemas in `backend/app/schemas.py`
2. Add the endpoint in `backend/app/routers/`
3. Update the TypeScript API client in `frontend/src/lib/api.ts`
4. Verify Swagger docs render correctly at `/docs`

---

## Adding ML Models

1. Create a training notebook in `notebooks/`
2. Add the inference wrapper in `backend/app/services/`
3. Register the model in `classifier.py` → `load_classifiers()`
4. Add fallback handling if the model weights aren't available

---

## Environment Variables

Never commit `.env` files or API keys. Update `.env.example` when adding new variables.

---

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a description of what changed and why
- Reference related issues if applicable
- Ensure the app runs locally before submitting

---

## Questions?

Open an issue on GitHub for bugs, feature requests, or questions.
