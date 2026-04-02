"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class InputType(str, Enum):
    TEXT = "text"
    URL = "url"
    CLAIM = "claim"


# --- Requests ---

class AnalyzeRequest(BaseModel):
    content: str = Field(..., min_length=10, description="Text, URL, or claim to analyze")
    input_type: InputType = Field(default=InputType.TEXT, description="Type of input")
    user_id: Optional[str] = Field(None, description="Authenticated user ID")
    user_email: Optional[str] = Field(None, description="Authenticated user email")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "content": "Breaking: Scientists discover that the earth is actually flat, according to a new study published in a non-peer-reviewed journal.",
                    "input_type": "text",
                }
            ]
        }
    }


class FeedbackRequest(BaseModel):
    is_correct: bool = Field(..., description="Whether the analysis verdict was correct")
    user_verdict: Optional[str] = Field(None, description="What user thinks the correct verdict is")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional feedback comment")


# --- Sub-score response models ---

class ClassificationResult(BaseModel):
    verdict: str
    fake_probability: float
    real_probability: float
    model: str


class SentimentResult(BaseModel):
    vader_compound: float
    sensationalism_score: float
    sentiment_score: float


class CredibilityResult(BaseModel):
    domain: Optional[str] = None
    score: float
    credibility_level: str
    category: str
    bias: str
    is_flagged: bool
    in_database: bool
    credibility_score: float


class FactCheckMatch(BaseModel):
    claim_text: str = ""
    claimant: str = "Unknown"
    rating: str = "Unknown"
    publisher: str = "Unknown"
    url: str = ""
    review_date: str = ""
    language: str = "en"


class FactCheckResult(BaseModel):
    has_matches: bool
    match_count: int
    matches: list[FactCheckMatch] = []
    fact_check_score: float
    api_available: bool = False


class ArticleInfo(BaseModel):
    title: Optional[str] = None
    authors: list[str] = []
    publish_date: Optional[str] = None
    source_domain: Optional[str] = None


class Highlight(BaseModel):
    text: str
    weight: float
    signal: str  # "fake" or "real"


class ExplainabilityResult(BaseModel):
    highlights: list[Highlight] = []
    explanation: Optional[str] = None  # Claude-generated natural language explanation
    method: str = "lime"
    available: bool = False


class LanguageResult(BaseModel):
    code: str = Field("en", description="ISO 639-1 language code")
    name: str = Field("English", description="Human-readable language name")
    confidence: float = Field(0.5, description="Detection confidence 0-1")
    method: str = Field("default", description="Detection method used")


class ClickbaitResult(BaseModel):
    available: bool = False
    mismatch_score: float = Field(0, description="Headline-body mismatch score 0-100")
    clickbait_score: float = Field(0, description="Overall clickbait score 0-1")
    pattern_matches: list[str] = Field([], description="Clickbait patterns found in headline")
    similarity: Optional[float] = Field(None, description="TF-IDF cosine similarity")
    headline: Optional[str] = None


# --- Main response ---

class AnalyzeResponse(BaseModel):
    id: str
    verdict: str = Field(..., description="Real, Misleading, or Fake")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    final_score: float = Field(..., ge=0, le=100, description="Final weighted score 0-100")
    input_text: str
    analyzed_text: Optional[str] = None
    input_type: str
    model_used: str
    created_at: Optional[str] = None

    # Sub-scores
    classification: ClassificationResult
    sentiment: SentimentResult
    credibility: CredibilityResult
    fact_check: FactCheckResult
    article_info: Optional[ArticleInfo] = None
    explainability: Optional[ExplainabilityResult] = None
    clickbait: Optional[ClickbaitResult] = None
    language: Optional[LanguageResult] = None


class AnalysisSummary(BaseModel):
    """Lightweight response for history listing."""
    id: str
    verdict: str
    confidence: float
    final_score: float
    input_type: str
    input_text: str  # Truncated
    model_used: str
    created_at: Optional[str] = None


class HistoryResponse(BaseModel):
    items: list[AnalysisSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class FeedbackResponse(BaseModel):
    id: int
    analysis_id: str
    is_correct: bool
    user_verdict: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[str] = None


class VerdictCount(BaseModel):
    verdict: str
    count: int


class TrendPoint(BaseModel):
    date: str
    count: int


class FlaggedSource(BaseModel):
    domain: str
    count: int
    avg_score: float


class StatsResponse(BaseModel):
    total_analyses: int
    verdict_distribution: list[VerdictCount]
    trends: list[TrendPoint]
    recent_analyses: list[AnalysisSummary]
    flagged_sources: list[FlaggedSource]


class ModelResult(BaseModel):
    model_name: str = Field(..., description="Name of the model")
    verdict: str
    confidence: float
    fake_probability: float
    real_probability: float
    inference_time_ms: float = Field(..., description="Inference time in milliseconds")
    available: bool = True


class CompareResponse(BaseModel):
    input_text: str
    models: list[ModelResult]


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_loaded: bool = False
    primary_model: Optional[str] = None
    version: str = "0.3.0"
