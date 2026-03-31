# VerifyAI — Project Overview

## What is VerifyAI?

VerifyAI is an AI-powered fake news detection platform that analyzes news articles, claims, and URLs to determine their credibility. Unlike simple binary classifiers, VerifyAI uses a **multi-signal analysis pipeline** that combines deep learning classification, sentiment analysis, source credibility scoring, real-time fact-checking, and explainable AI to deliver transparent, trustworthy verdicts.

## The Problem

In 2026, misinformation is more sophisticated than ever:

- **AI-generated articles** are nearly indistinguishable from human-written content
- **Deepfakes and manipulated media** spread faster than corrections
- **Social media algorithms** amplify sensational, often misleading content
- **Traditional fact-checking** is too slow — by the time a claim is debunked, millions have already seen it

People need a fast, reliable tool that doesn't just say "fake" or "real" — it needs to explain **why** and show **evidence**.

## The Solution

VerifyAI provides:

- **Instant credibility scoring** (0-100%) with a clear verdict (Real / Misleading / Fake)
- **Multi-signal analysis** — not just text classification, but sentiment, source reputation, and cross-referenced fact-checks
- **Explainable AI** — every verdict comes with a human-readable explanation of what was flagged and why
- **Highlighted suspicious phrases** — users can see exactly which parts of the text triggered the detection
- **Analysis history & dashboard** — track past checks with aggregate statistics

## How It Works — The 7-Step Analysis Pipeline

```
User Input (text / URL / claim)
        │
        ▼
┌─────────────────────────────────────────┐
│  Step 1: Text Preprocessing             │
│  - Extract text from URL (if provided)  │
│  - Clean, tokenize, normalize           │
│  - Extract key claims from the text     │
├─────────────────────────────────────────┤
│  Step 2: Deep Learning Classification   │
│  - Fine-tuned RoBERTa model             │
│  - Outputs: fake/real probability       │
│  - Trained on LIAR + FakeNewsNet + ISOT │
├─────────────────────────────────────────┤
│  Step 3: Sentiment & Bias Analysis      │
│  - Emotional tone detection (VADER)     │
│  - Sensationalism scoring               │
│  - Clickbait language detection         │
├─────────────────────────────────────────┤
│  Step 4: Source Credibility Check       │
│  - Domain reputation lookup             │
│  - Publisher history scoring            │
│  - Known unreliable source flagging     │
├─────────────────────────────────────────┤
│  Step 5: Fact-Check Cross-Reference     │
│  - Google Fact Check Tools API          │
│  - Match claims against existing        │
│    fact-checks from trusted orgs        │
├─────────────────────────────────────────┤
│  Step 6: Explainability Report          │
│  - LIME/SHAP for model interpretability │
│  - Claude API for natural-language      │
│    explanation generation               │
├─────────────────────────────────────────┤
│  Step 7: Score Aggregation & Verdict    │
│  - Weighted combination of all signals  │
│  - Final verdict + confidence score     │
│  - Structured response with evidence    │
└─────────────────────────────────────────┘
        │
        ▼
  Verdict + Score + Explanation + Highlights
```

## Target Users

| User Type | Use Case |
|-----------|----------|
| **General Public** | Verify suspicious articles before sharing on social media |
| **Journalists** | Quick preliminary check on sources and claims |
| **Students & Researchers** | Evaluate source credibility for academic work |
| **Content Moderators** | Assist in flagging potentially misleading content |
| **Developers** | Integrate via API into their own applications |

## What Makes VerifyAI Different

| Feature | Basic Detectors | VerifyAI |
|---------|----------------|----------|
| Classification | Binary (fake/real) | Multi-class with confidence % |
| Input types | Text only | Text, URL, and claims |
| Explanation | None | Full explainability report |
| Fact-checking | None | Cross-references Google Fact Check |
| Source analysis | None | Domain credibility scoring |
| Sentiment detection | None | Sensationalism & bias scoring |
| History | None | Full dashboard with stats |
| API | None | RESTful API with docs |

## Technology Stack

### Frontend
- **Next.js 14+** (App Router) — React framework with SSR/SSG
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible, polished component library
- **Recharts** — Dashboard charts and visualizations
- **NextAuth.js** — Authentication (Google/GitHub OAuth)

### Backend
- **Python 3.12+** — Primary backend language
- **FastAPI** — High-performance async API framework
- **SQLAlchemy** — ORM for database operations
- **Alembic** — Database migrations

### AI / ML
- **RoBERTa (fine-tuned)** — Primary classification model (Hugging Face Transformers)
- **TF-IDF + Logistic Regression** — Baseline model for comparison
- **VADER + TextBlob** — Sentiment and emotional tone analysis
- **LIME / SHAP** — Model explainability and feature importance
- **Claude API** — Natural-language explanation generation

### External Services
- **Google Fact Check Tools API** — Cross-reference existing fact-checks
- **newspaper3k / BeautifulSoup** — Article scraping from URLs
- **NewsAPI** — Supplementary article data (optional)

### Infrastructure
- **PostgreSQL** — Primary database
- **Docker** — Containerized deployment
- **Vercel** — Frontend hosting
- **Railway / Render** — Backend hosting

## Data & Training

### Datasets
| Dataset | Size | Description |
|---------|------|-------------|
| **LIAR** | 12.8K statements | 6-class labels from PolitiFact |
| **FakeNewsNet** | 23K+ articles | Political and celebrity fake news |
| **ISOT Fake News** | 44K articles | Reuters (real) + unreliable sources (fake) |

### Model Performance Targets
| Model | Target Accuracy | Inference Time |
|-------|----------------|----------------|
| TF-IDF + LogReg (baseline) | 93-95% | <10ms |
| Fine-tuned RoBERTa | 97-99% | <200ms |
| Full pipeline (all signals) | — | <3 seconds |

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Submit text/URL for analysis |
| `/analyze/{id}` | GET | Retrieve a past analysis |
| `/history` | GET | User's analysis history (paginated) |
| `/stats` | GET | Aggregate statistics |
| `/feedback/{id}` | POST | User corrects a verdict |
| `/health` | GET | Service health check |

## Success Metrics

- **Model accuracy** ≥ 97% on test set (RoBERTa)
- **API response time** < 3 seconds for full pipeline
- **User satisfaction** — verdicts align with known fact-checks
- **Explainability clarity** — users understand why content was flagged
- **Code quality** — clean architecture, typed, tested, documented
