# VerifyAI — Implementation Plan

## Development Phases

This plan is organized into 4 phases. Each phase builds on the previous one and results in a working, demoable product. The principle: **always have something that works**.

---

## Phase 1 — Foundation & ML Model (Week 1-2)

> **Goal:** Train a working classification model and serve it via a basic API.

### 1.1 Project Setup
- [ ] Initialize monorepo structure (`frontend/`, `backend/`, `notebooks/`, `data/`)
- [ ] Set up Python virtual environment + `requirements.txt`
- [ ] Set up Next.js app with Tailwind CSS + shadcn/ui
- [ ] Configure Docker Compose for PostgreSQL
- [ ] Set up `.env` files for both frontend and backend
- [ ] Initialize git repository with `.gitignore`

### 1.2 Data Collection & Exploration
- [ ] Download datasets: LIAR, ISOT Fake News, FakeNewsNet
- [ ] Create `01_data_exploration.ipynb` notebook
- [ ] Analyze class distributions, text lengths, common patterns
- [ ] Clean and preprocess data (remove duplicates, handle missing values)
- [ ] Create unified dataset with consistent labels (real/fake)
- [ ] Split into train/validation/test sets (80/10/10)

### 1.3 Baseline Model
- [ ] Create `02_baseline_model.ipynb` notebook
- [ ] Build TF-IDF + Logistic Regression pipeline
- [ ] Train, evaluate, and log metrics (accuracy, precision, recall, F1)
- [ ] Save model with joblib
- [ ] Target: 93-95% accuracy

### 1.4 RoBERTa Fine-tuning
- [ ] Create `03_roberta_finetuning.ipynb` notebook
- [ ] Load `roberta-base` from Hugging Face
- [ ] Tokenize dataset with RoBERTa tokenizer
- [ ] Fine-tune with Hugging Face Trainer (3-5 epochs)
- [ ] Evaluate on test set — log confusion matrix, classification report
- [ ] Save fine-tuned model weights to `backend/ml/models/`
- [ ] Target: 97-99% accuracy

### 1.5 Basic FastAPI Server
- [ ] Create FastAPI app skeleton (`main.py`, routers, config)
- [ ] Load fine-tuned RoBERTa model at startup
- [ ] Implement `POST /analyze` — accepts text, returns fake/real probability
- [ ] Implement `GET /health` — returns service status
- [ ] Add CORS middleware for Next.js frontend
- [ ] Test with Swagger UI (`/docs`)

### Phase 1 Deliverable
> A working API that accepts text and returns a classification result. Model training process documented in notebooks.

---

## Phase 2 — Core Features & Frontend (Week 3-4)

> **Goal:** Build the full analysis pipeline and a usable frontend.

### 2.1 Analysis Pipeline Services
- [ ] `classifier.py` — RoBERTa inference + baseline model fallback
- [ ] `sentiment.py` — VADER sentiment + custom sensationalism scoring
  - Detect emotional language, ALL CAPS, excessive punctuation
  - Score from 0 (neutral) to 1 (highly sensational)
- [ ] `credibility.py` — Source credibility checker
  - Build `sources_credibility.json` with ~500 domains + trust scores
  - Extract domain from URL, look up score
  - Flag known unreliable sources
- [ ] `scraper.py` — URL to article text extraction
  - Use newspaper3k for article extraction
  - Fallback to BeautifulSoup for edge cases
  - Extract: title, text, authors, publish date, source domain
- [ ] `fact_checker.py` — Google Fact Check Tools API integration
  - Search claims against existing fact-checks
  - Return matching fact-checks with ratings and sources

### 2.2 Pipeline Orchestration
- [ ] Create `pipeline.py` that runs all services in sequence
- [ ] Define weighted scoring formula:
  ```
  final_score = (
      0.45 * classification_score +
      0.20 * sentiment_score +
      0.20 * source_credibility_score +
      0.15 * fact_check_score
  )
  ```
- [ ] Map score to verdict: Real (0-30), Misleading (30-65), Fake (65-100)
- [ ] Structure response with all sub-scores and evidence

### 2.3 Database Setup
- [ ] Define SQLAlchemy models:
  - `Analysis` — stores each analysis result
  - `Feedback` — stores user corrections
- [ ] Set up Alembic for migrations
- [ ] Implement `POST /analyze` with DB persistence
- [ ] Implement `GET /analyze/{id}` to retrieve past results
- [ ] Implement `GET /history` with pagination

### 2.4 Frontend — Input & Results Pages
- [ ] Landing page with analysis form
  - Text input (textarea)
  - URL input
  - Claim input (short text)
  - Submit button with loading state
- [ ] Results page (`/results/[id]`)
  - Verdict card with color-coded score (green/yellow/red)
  - Confidence meter (circular or bar gauge)
  - Sentiment & bias scores
  - Source credibility badge
  - Highlighted suspicious phrases in the original text
- [ ] Connect frontend to FastAPI backend via API client (`lib/api.ts`)
- [ ] Loading states, error handling, responsive design

### Phase 2 Deliverable
> Full analysis pipeline working end-to-end. Users can paste text or a URL, get a detailed multi-signal verdict with scores and evidence.

---

## Phase 3 — Explainability, Dashboard & Polish (Week 5-6)

> **Goal:** Add the features that make this project stand out from typical portfolio projects.

### 3.1 Explainability Engine
- [ ] Integrate LIME for text classification explanations
  - Highlight which words contributed most to the classification
  - Generate feature importance data for visualization
- [ ] Integrate Claude API for natural-language explanations
  - Send article + model outputs to Claude
  - Prompt: generate a 3-4 sentence explanation of why the verdict was given
  - Include specific evidence and reasoning
- [ ] Build `ExplainabilityReport` component on frontend
  - Word-level highlighting (green = supports real, red = supports fake)
  - Claude's natural-language explanation
  - Expandable details for each analysis signal

### 3.2 Dashboard & History
- [ ] Dashboard page (`/dashboard`)
  - Total analyses count
  - Fake vs Real vs Misleading distribution (pie chart)
  - Analysis trends over time (line chart)
  - Recent analyses list
  - Most flagged sources
- [ ] History page with filters and search
  - Filter by verdict, date range, source
  - Sortable table with pagination
- [ ] Use Recharts for all visualizations

### 3.3 User Authentication
- [ ] Set up NextAuth.js with Google and GitHub providers
- [ ] Protected routes (dashboard, history)
- [ ] Associate analyses with user accounts
- [ ] Public analysis (no login required) + saved history (login required)

### 3.4 User Feedback System
- [ ] Add feedback buttons on results page (Correct / Incorrect)
- [ ] `POST /feedback/{id}` endpoint
- [ ] Store feedback in database for potential model retraining
- [ ] Show community consensus if multiple users analyzed the same content

### 3.5 UI Polish
- [ ] Dark mode toggle (Tailwind dark mode)
- [ ] Smooth page transitions and animations
- [ ] Mobile-responsive design
- [ ] Proper meta tags and Open Graph for link previews
- [ ] 404 and error pages
- [ ] FastAPI auto-generated Swagger docs at `/docs`

### Phase 3 Deliverable
> A polished, production-quality app with explainable AI, user accounts, dashboard analytics, and dark mode. Ready for portfolio screenshots.

---

## Phase 4 — Bonus Features (Optional, Week 7+)

> **Goal:** Stretch features that elevate this from great to exceptional.

### 4.1 Chrome Browser Extension
- [ ] Manifest V3 extension
- [ ] Content script that adds a "Verify" button next to articles
- [ ] Popup with quick verdict display
- [ ] Calls the same FastAPI backend

### 4.2 Clickbait Detector
- [ ] Compare headline semantics vs article body using sentence embeddings
- [ ] Score headline-content mismatch (0-100)
- [ ] Display as separate signal in the results

### 4.3 Model Comparison Page
- [ ] Side-by-side results: RoBERTa vs Logistic Regression vs Claude
- [ ] Show how different models rate the same article
- [ ] Display inference time comparisons
- [ ] Great for demonstrating ML knowledge in interviews

### 4.4 Multilingual Support
- [ ] Swap RoBERTa for XLM-RoBERTa (multilingual)
- [ ] Auto-detect language of input
- [ ] Support at least English + one more language

---

## Technical Decisions & Trade-offs

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Monorepo vs separate repos | Monorepo | Simpler for portfolio, easier to review |
| RoBERTa vs BERT | RoBERTa | Better pre-training, consistently higher accuracy |
| FastAPI vs Flask | FastAPI | Async, auto docs, type-safe, modern |
| PostgreSQL vs MongoDB | PostgreSQL | Structured data, better for analytics |
| LIME vs SHAP | LIME (primary) | Faster for text, more intuitive visualizations |
| Self-hosted model vs API-only | Self-hosted + API | Shows ML skill (fine-tuning) + practical skill (API integration) |
| shadcn/ui vs Material UI | shadcn/ui | Lighter, more customizable, modern aesthetics |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Model overfitting | Use cross-validation, monitor train/val gap, use multiple datasets |
| Slow inference | Cache frequent queries, use baseline model as fast fallback |
| API rate limits (Google Fact Check) | Cache results, graceful degradation if API unavailable |
| Scraping failures | Multiple fallback parsers, return partial results if scraping fails |
| Scope creep | Strict phase boundaries — Phase 1-3 is the target, Phase 4 is optional |
