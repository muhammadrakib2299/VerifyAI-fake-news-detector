"""VerifyAI — FastAPI Application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .dependencies import load_model
from .database import create_tables
from .routers import analyze, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and create tables on startup."""
    create_tables()
    load_model()
    yield


app = FastAPI(
    title="VerifyAI API",
    description="""
## AI-Powered Fake News Detection API

VerifyAI analyzes news articles, claims, and URLs using a **multi-signal analysis pipeline**:

- **RoBERTa Classification** — Fine-tuned deep learning model (97%+ accuracy)
- **Sentiment Analysis** — VADER sentiment scoring + sensationalism detection
- **Source Credibility** — 520+ domain trust database lookup
- **Fact-Checking** — Google Fact Check Tools API cross-referencing
- **Explainability** — LIME word-level importance + Claude AI explanations

### Verdict Scale
| Score Range | Verdict |
|------------|---------|
| 0-30 | Real |
| 30-65 | Misleading |
| 65-100 | Fake |

### Quick Start
1. `POST /analyze` with text, URL, or claim
2. `GET /analyze/{id}` to retrieve results
3. `GET /history` to browse past analyses
4. `GET /stats` for dashboard statistics
""",
    version="0.3.0",
    lifespan=lifespan,
    license_info={
        "name": "MIT",
    },
    openapi_tags=[
        {
            "name": "Analysis",
            "description": "Run analyses, retrieve results, submit feedback, and view statistics.",
        },
        {
            "name": "Health",
            "description": "Service health checks and model status.",
        },
    ],
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(health.router, tags=["Health"])


@app.get("/")
async def root():
    return {"message": "Welcome to VerifyAI API", "docs": "/docs"}
