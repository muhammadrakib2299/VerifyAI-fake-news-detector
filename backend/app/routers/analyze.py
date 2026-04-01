"""Analysis endpoints — full pipeline with DB persistence."""

import math
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from ..schemas import (
    AnalyzeRequest, AnalyzeResponse, AnalysisSummary,
    HistoryResponse, FeedbackRequest, FeedbackResponse,
    ClassificationResult, SentimentResult, CredibilityResult,
    FactCheckResult, FactCheckMatch, ArticleInfo,
    ExplainabilityResult, Highlight,
)
from ..dependencies import get_classifier
from ..database import get_db
from ..models import Analysis, Feedback
from ..services.pipeline import run_pipeline

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """Run full analysis pipeline on text, URL, or claim."""
    classifiers = get_classifier()

    if classifiers is None or classifiers.get("primary") is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        result = await run_pipeline(
            content=request.content,
            input_type=request.input_type.value,
            classifiers=classifiers,
        )

        # Persist to database
        analysis = Analysis(
            id=result["id"],
            input_text=request.content,
            input_type=request.input_type.value,
            source_url=request.content if request.input_type == "url" else None,
            verdict=result["verdict"],
            final_score=result["final_score"],
            confidence=result["confidence"],
            model_used=result["model_used"],
            classification_data=result["classification"],
            sentiment_data=result["sentiment"],
            credibility_data=result["credibility"],
            fact_check_data=result["fact_check"],
            explainability_data=result.get("explainability"),
            article_info=result.get("article_info"),
            analyzed_text=result.get("analyzed_text"),
        )
        db.add(analysis)
        db.commit()

        return _build_response(result)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analyze/{analysis_id}", response_model=AnalyzeResponse)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve a past analysis by ID."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return _build_response_from_db(analysis)


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    verdict: str = Query(None, description="Filter by verdict: Real, Misleading, Fake"),
    db: Session = Depends(get_db),
):
    """Get analysis history with pagination."""
    query = db.query(Analysis)

    if verdict:
        query = query.filter(Analysis.verdict == verdict)

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))

    items = (
        query
        .order_by(Analysis.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return HistoryResponse(
        items=[
            AnalysisSummary(
                id=a.id,
                verdict=a.verdict,
                confidence=a.confidence,
                final_score=a.final_score,
                input_type=a.input_type,
                input_text=a.input_text[:200],
                model_used=a.model_used,
                created_at=a.created_at.isoformat() if a.created_at else None,
            )
            for a in items
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/feedback/{analysis_id}", response_model=FeedbackResponse)
async def submit_feedback(
    analysis_id: str,
    request: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Submit feedback on an analysis result."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    feedback = Feedback(
        analysis_id=analysis_id,
        is_correct=request.is_correct,
        user_verdict=request.user_verdict,
        comment=request.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        analysis_id=feedback.analysis_id,
        is_correct=feedback.is_correct,
        user_verdict=feedback.user_verdict,
        comment=feedback.comment,
        created_at=feedback.created_at.isoformat() if feedback.created_at else None,
    )


def _build_response(result: dict) -> AnalyzeResponse:
    """Build AnalyzeResponse from pipeline result dict."""
    fact_check = result["fact_check"]
    return AnalyzeResponse(
        id=result["id"],
        verdict=result["verdict"],
        confidence=result["confidence"],
        final_score=result["final_score"],
        input_text=result["input_text"],
        analyzed_text=result.get("analyzed_text"),
        input_type=result["input_type"],
        model_used=result["model_used"],
        created_at=result.get("created_at"),
        classification=ClassificationResult(**result["classification"]),
        sentiment=SentimentResult(**result["sentiment"]),
        credibility=CredibilityResult(**result["credibility"]),
        fact_check=FactCheckResult(
            has_matches=fact_check["has_matches"],
            match_count=fact_check["match_count"],
            matches=[FactCheckMatch(**m) for m in fact_check.get("matches", [])],
            fact_check_score=fact_check["fact_check_score"],
            api_available=fact_check.get("api_available", False),
        ),
        article_info=ArticleInfo(**result["article_info"]) if result.get("article_info") else None,
        explainability=_build_explainability(result.get("explainability")),
    )


def _build_explainability(data: dict | None) -> ExplainabilityResult | None:
    """Build ExplainabilityResult from pipeline or DB data."""
    if not data:
        return None
    return ExplainabilityResult(
        highlights=[Highlight(**h) for h in data.get("highlights", [])],
        explanation=data.get("explanation"),
        method=data.get("method", "lime"),
        available=data.get("available", False),
    )


def _build_response_from_db(analysis: Analysis) -> AnalyzeResponse:
    """Build AnalyzeResponse from a database Analysis record."""
    cls = analysis.classification_data or {}
    sent = analysis.sentiment_data or {}
    cred = analysis.credibility_data or {}
    fc = analysis.fact_check_data or {}
    expl = analysis.explainability_data or {}
    art = analysis.article_info or {}

    return AnalyzeResponse(
        id=analysis.id,
        verdict=analysis.verdict,
        confidence=analysis.confidence,
        final_score=analysis.final_score,
        input_text=analysis.input_text,
        analyzed_text=analysis.analyzed_text,
        input_type=analysis.input_type,
        model_used=analysis.model_used,
        created_at=analysis.created_at.isoformat() if analysis.created_at else None,
        classification=ClassificationResult(
            verdict=cls.get("verdict", analysis.verdict),
            fake_probability=cls.get("fake_probability", 0),
            real_probability=cls.get("real_probability", 0),
            model=cls.get("model", analysis.model_used),
        ),
        sentiment=SentimentResult(
            vader_compound=sent.get("vader_compound", 0),
            sensationalism_score=sent.get("sensationalism_score", 0),
            sentiment_score=sent.get("sentiment_score", 0),
        ),
        credibility=CredibilityResult(
            domain=cred.get("domain"),
            score=cred.get("score", 50),
            credibility_level=cred.get("credibility_level", "unknown"),
            category=cred.get("category", "unknown"),
            bias=cred.get("bias", "unknown"),
            is_flagged=cred.get("is_flagged", False),
            in_database=cred.get("in_database", False),
            credibility_score=cred.get("credibility_score", 0.5),
        ),
        fact_check=FactCheckResult(
            has_matches=fc.get("has_matches", False),
            match_count=fc.get("match_count", 0),
            matches=[FactCheckMatch(**m) for m in fc.get("matches", [])],
            fact_check_score=fc.get("fact_check_score", 0.5),
            api_available=fc.get("api_available", False),
        ),
        article_info=ArticleInfo(**art) if art and art.get("title") else None,
        explainability=_build_explainability(expl if expl else None),
    )
