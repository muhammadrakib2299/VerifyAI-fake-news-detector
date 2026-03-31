# VerifyAI — TODO Tracker

> Track progress by marking items: `[x]` when done, `[-]` for in-progress, `[ ]` for not started.

---

## Phase 1 — Foundation & ML Model

### Setup
- [ ] Initialize monorepo folder structure
- [ ] Set up Python virtual environment + install dependencies
- [ ] Initialize Next.js app with Tailwind CSS + shadcn/ui
- [ ] Set up Docker Compose for PostgreSQL
- [ ] Configure environment variables (`.env` files)
- [ ] Initialize git repo + write `.gitignore`

### Data
- [ ] Download LIAR dataset
- [ ] Download ISOT Fake News dataset
- [ ] Download FakeNewsNet dataset
- [ ] Create data exploration notebook (`01_data_exploration.ipynb`)
- [ ] Clean and preprocess all datasets
- [ ] Create unified train/val/test splits

### Baseline Model
- [ ] Create baseline model notebook (`02_baseline_model.ipynb`)
- [ ] Implement TF-IDF + Logistic Regression pipeline
- [ ] Train and evaluate — log accuracy, precision, recall, F1
- [ ] Save trained model with joblib

### RoBERTa Model
- [ ] Create fine-tuning notebook (`03_roberta_finetuning.ipynb`)
- [ ] Load and tokenize data with RoBERTa tokenizer
- [ ] Fine-tune `roberta-base` using Hugging Face Trainer
- [ ] Evaluate on test set — confusion matrix + classification report
- [ ] Save model weights to `backend/ml/models/`
- [ ] Verify model loads and runs inference correctly

### Basic API
- [ ] Create FastAPI app skeleton
- [ ] Load model at startup
- [ ] Implement `POST /analyze` (text → classification result)
- [ ] Implement `GET /health`
- [ ] Add CORS middleware
- [ ] Test all endpoints via Swagger UI

---

## Phase 2 — Core Features & Frontend

### Backend Services
- [ ] Implement `classifier.py` — RoBERTa inference wrapper
- [ ] Implement `sentiment.py` — VADER + sensationalism scoring
- [ ] Implement `credibility.py` — domain reputation lookup
- [ ] Build `sources_credibility.json` (500+ domains with trust scores)
- [ ] Implement `scraper.py` — URL → article text extraction
- [ ] Implement `fact_checker.py` — Google Fact Check API
- [ ] Create `pipeline.py` — orchestrate all services with weighted scoring

### Database
- [ ] Define SQLAlchemy models (`Analysis`, `Feedback`)
- [ ] Set up Alembic migrations
- [ ] Implement analysis persistence in `/analyze` endpoint
- [ ] Implement `GET /analyze/{id}`
- [ ] Implement `GET /history` with pagination

### Frontend Pages
- [ ] Build landing page with analysis form (text / URL / claim inputs)
- [ ] Build results page (`/results/[id]`)
- [ ] Create `VerdictCard` component (color-coded score)
- [ ] Create `CredibilityMeter` component
- [ ] Create sentiment/bias display components
- [ ] Create suspicious phrase highlighting
- [ ] Create API client (`lib/api.ts`)
- [ ] Add loading states and error handling
- [ ] Make all pages responsive

---

## Phase 3 — Explainability, Dashboard & Polish

### Explainability
- [ ] Integrate LIME for word-level feature importance
- [ ] Integrate Claude API for natural-language explanation generation
- [ ] Build `ExplainabilityReport` frontend component
- [ ] Add word-level highlighting (green/red for real/fake signals)

### Dashboard
- [ ] Build dashboard page (`/dashboard`)
- [ ] Add total analyses counter
- [ ] Add verdict distribution pie chart
- [ ] Add analysis trends line chart
- [ ] Add recent analyses list
- [ ] Add most flagged sources display

### Authentication
- [ ] Set up NextAuth.js (Google + GitHub providers)
- [ ] Add protected routes (dashboard, history)
- [ ] Associate analyses with user accounts
- [ ] Allow public analysis without login

### Feedback System
- [ ] Add Correct/Incorrect buttons on results page
- [ ] Implement `POST /feedback/{id}` endpoint
- [ ] Store feedback in database

### UI Polish
- [ ] Implement dark mode toggle
- [ ] Add page transitions and loading animations
- [ ] Finalize mobile responsive design
- [ ] Add meta tags + Open Graph tags
- [ ] Create 404 and error pages
- [ ] Verify Swagger docs at `/docs`

---

## Phase 4 — Bonus (Optional)

### Chrome Extension
- [ ] Create Manifest V3 extension scaffold
- [ ] Build content script (adds "Verify" button to articles)
- [ ] Build popup UI with quick verdict display
- [ ] Connect to FastAPI backend

### Clickbait Detector
- [ ] Implement headline vs body semantic comparison
- [ ] Score headline-content mismatch
- [ ] Add as signal in analysis results

### Model Comparison Page
- [ ] Build comparison page in frontend
- [ ] Show side-by-side: RoBERTa vs LogReg vs Claude
- [ ] Display inference time comparisons

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
| Phase 1 — Foundation & ML | Not Started | 0/22 |
| Phase 2 — Core Features | Not Started | 0/21 |
| Phase 3 — Polish & Explainability | Not Started | 0/18 |
| Phase 4 — Bonus | Not Started | 0/11 |
| Deployment | Not Started | 0/7 |
| Documentation | Not Started | 0/6 |
| **Total** | **Not Started** | **0/85** |
