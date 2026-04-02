# VerifyAI — TODO Tracker

> Track progress by marking items: `[x]` when done, `[-]` for in-progress, `[ ]` for not started.

---

## Phase 1 — Foundation & ML Model

### Setup
- [x] Initialize monorepo folder structure
- [x] Set up Python virtual environment + install dependencies
- [x] Initialize Next.js app with Tailwind CSS + shadcn/ui
- [x] Set up Docker Compose for PostgreSQL
- [x] Configure environment variables (`.env` files)
- [x] Initialize git repo + write `.gitignore`

### Data
- [x] Download LIAR dataset
- [x] Download ISOT Fake News dataset
- [x] Download FakeNewsNet dataset
- [x] Create data exploration notebook (`01_data_exploration.ipynb`)
- [x] Clean and preprocess all datasets
- [x] Create unified train/val/test splits

### Baseline Model
- [x] Create baseline model notebook (`02_baseline_model.ipynb`)
- [x] Implement TF-IDF + Logistic Regression pipeline
- [x] Train and evaluate — log accuracy, precision, recall, F1
- [x] Save trained model with joblib

### RoBERTa Model
- [x] Create fine-tuning notebook (`03_roberta_finetuning.ipynb`)
- [x] Load and tokenize data with RoBERTa tokenizer
- [x] Fine-tune `roberta-base` using Hugging Face Trainer
- [x] Evaluate on test set — confusion matrix + classification report
- [x] Save model weights to `backend/ml/models/`
- [x] Verify model loads and runs inference correctly

### Basic API
- [x] Create FastAPI app skeleton
- [x] Load model at startup
- [x] Implement `POST /analyze` (text → classification result)
- [x] Implement `GET /health`
- [x] Add CORS middleware
- [x] Test all endpoints via Swagger UI

---

## Phase 2 — Core Features & Frontend

### Backend Services
- [x] Implement `classifier.py` — RoBERTa inference wrapper + baseline fallback
- [x] Implement `sentiment.py` — VADER + sensationalism scoring
- [x] Implement `credibility.py` — domain reputation lookup
- [x] Build `sources_credibility.json` (520 domains with trust scores)
- [x] Implement `scraper.py` — URL → article text extraction
- [x] Implement `fact_checker.py` — Google Fact Check API
- [x] Create `pipeline.py` — orchestrate all services with weighted scoring

### Database
- [x] Define SQLAlchemy models (`Analysis`, `Feedback`)
- [x] Set up Alembic migrations
- [x] Implement analysis persistence in `/analyze` endpoint
- [x] Implement `GET /analyze/{id}`
- [x] Implement `GET /history` with pagination

### Frontend Pages
- [x] Build landing page with analysis form (text / URL / claim inputs)
- [x] Build results page (`/results/[id]`)
- [x] Create `VerdictCard` component (color-coded score + confidence ring)
- [x] Create `ScoreBreakdown` component (weighted bar chart)
- [x] Create sentiment/bias display components
- [x] Create source credibility badge component
- [x] Create fact-check section component
- [x] Create API client (`lib/api.ts`)
- [x] Add loading states and error handling
- [x] Build history page with filtering and pagination
- [x] Add user feedback (Correct/Incorrect) on results page

---

## Phase 3 — Explainability, Dashboard & Polish

### Explainability
- [x] Integrate LIME for word-level feature importance
- [x] Integrate Claude API for natural-language explanation generation
- [x] Build `ExplainabilityReport` frontend component
- [x] Add word-level highlighting (green/red for real/fake signals)

### Dashboard
- [x] Build dashboard page (`/dashboard`)
- [x] Add total analyses counter
- [x] Add verdict distribution pie chart
- [x] Add analysis trends line chart
- [x] Add recent analyses list
- [x] Add most flagged sources display

### Authentication
- [x] Set up NextAuth.js (Google + GitHub providers)
- [x] Add protected routes (dashboard, history)
- [x] Associate analyses with user accounts
- [x] Allow public analysis without login

### Feedback System
- [x] Add Correct/Incorrect buttons on results page
- [x] Implement `POST /feedback/{id}` endpoint
- [x] Store feedback in database

### UI Polish
- [x] Implement dark mode toggle
- [x] Add page transitions and loading animations
- [x] Finalize mobile responsive design
- [x] Add meta tags + Open Graph tags
- [x] Create 404 and error pages
- [x] Verify Swagger docs at `/docs`

---

## Phase 4 — Bonus (Optional)

### Chrome Extension
- [x] Create Manifest V3 extension scaffold
- [x] Build content script (adds "Verify" button to articles)
- [x] Build popup UI with quick verdict display
- [x] Connect to FastAPI backend

### Clickbait Detector
- [x] Implement headline vs body semantic comparison
- [x] Score headline-content mismatch
- [x] Add as signal in analysis results

### Model Comparison Page
- [x] Build comparison page in frontend
- [x] Show side-by-side: RoBERTa vs LogReg vs Claude
- [x] Display inference time comparisons

### Multilingual
- [ ] Integrate XLM-RoBERTa for multilingual classification
- [ ] Add language auto-detection
- [ ] Test with non-English articles

---

## Deployment
- [ ] Create Dockerfile for backend
- [ ] Create `docker-compose.yml` (backend + PostgreSQL)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway or Render
- [ ] Set up environment variables in production
- [ ] Configure custom domain (optional)
- [ ] Final end-to-end testing in production

---

## Documentation
- [ ] Write comprehensive README.md
- [ ] Add API documentation examples
- [ ] Add screenshots/GIFs to README
- [ ] Document model training process in notebooks
- [ ] Add inline code comments where needed
- [ ] Write CONTRIBUTING.md (optional)

---

## Status Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1 — Foundation & ML | Complete | 22/22 |
| Phase 2 — Core Features | Complete | 23/23 |
| Phase 3 — Polish & Explainability | Complete | 18/18 |
| Phase 4 — Bonus | Not Started | 0/11 |
| Deployment | Not Started | 0/7 |
| Documentation | Not Started | 0/6 |
| **Total** | **In Progress** | **63/87** |
