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


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_loaded: bool = False
    primary_model: Optional[str] = None
    version: str = "0.2.0"
