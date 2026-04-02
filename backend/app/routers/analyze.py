"""Analysis endpoints — full pipeline with DB persistence."""

import math
import time
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..schemas import (
    AnalyzeRequest, AnalyzeResponse, AnalysisSummary,
    HistoryResponse, FeedbackRequest, FeedbackResponse,
    ClassificationResult, SentimentResult, CredibilityResult,
    FactCheckResult, FactCheckMatch, ArticleInfo,
    ExplainabilityResult, Highlight, ClickbaitResult,
    CompareResponse, ModelResult,
    StatsResponse, VerdictCount, TrendPoint, FlaggedSource,
)
from ..dependencies import get_classifier
from ..database import get_db
from ..models import Analysis, Feedback
from ..services.pipeline import run_pipeline

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze content for fake news",
    response_description="Complete analysis result with verdict, sub-scores, and explainability",
)
async def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Run the full multi-signal analysis pipeline on text, URL, or claim.

    The pipeline includes:
    - **RoBERTa classification** (45% weight) — deep learning fake/real prediction
    - **Sentiment analysis** (20% weight) — sensationalism and emotional tone scoring
    - **Source credibility** (20% weight) — domain reputation lookup against 520+ sources
    - **Fact-checking** (15% weight) — Google Fact Check Tools API cross-reference
    - **Explainability** — LIME word-level highlights + AI-generated explanation
    """
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
            user_id=request.user_id,
            user_email=request.user_email,
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
            clickbait_data=result.get("clickbait"),
            article_info=result.get("article_info"),
            analyzed_text=result.get("analyzed_text"),
        )
        db.add(analysis)
        db.commit()

        return _build_response(result)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get(
    "/analyze/{analysis_id}",
    response_model=AnalyzeResponse,
    summary="Get analysis by ID",
    response_description="Full analysis details including all sub-scores and explainability data",
)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve a past analysis by its UUID."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return _build_response_from_db(analysis)


@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Browse analysis history",
    response_description="Paginated list of past analyses with summary data",
)
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    verdict: str = Query(None, description="Filter by verdict: Real, Misleading, Fake"),
    user_email: str = Query(None, description="Filter by user email"),
    db: Session = Depends(get_db),
):
    """Get paginated analysis history, optionally filtered by verdict and user."""
    query = db.query(Analysis)

    if user_email:
        query = query.filter(Analysis.user_email == user_email)

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


@router.post(
    "/feedback/{analysis_id}",
    response_model=FeedbackResponse,
    summary="Submit feedback on an analysis",
    response_description="Confirmed feedback record",
)
async def submit_feedback(
    analysis_id: str,
    request: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Submit user feedback (correct/incorrect) on an analysis result for model improvement."""
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


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Get dashboard statistics",
    response_description="Aggregate statistics including verdict distribution, trends, and flagged sources",
)
async def get_stats(
    user_email: str = Query(None, description="Filter stats by user email"),
    db: Session = Depends(get_db),
):
    """Get aggregate dashboard statistics: verdict distribution, 30-day trends, recent analyses, and most flagged sources."""
    base_query = db.query(Analysis)
    if user_email:
        base_query = base_query.filter(Analysis.user_email == user_email)

    # Total analyses
    total = base_query.with_entities(func.count(Analysis.id)).scalar() or 0

    # Verdict distribution
    verdict_rows = (
        base_query.with_entities(Analysis.verdict, func.count(Analysis.id))
        .group_by(Analysis.verdict)
        .all()
    )
    verdict_distribution = [
        VerdictCount(verdict=v, count=c) for v, c in verdict_rows
    ]

    # Trends — daily counts for the last 30 days
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    trend_query = base_query.filter(Analysis.created_at >= thirty_days_ago)
    trend_rows = (
        trend_query.with_entities(
            func.date(Analysis.created_at).label("date"),
            func.count(Analysis.id).label("count"),
        )
        .group_by(func.date(Analysis.created_at))
        .order_by(func.date(Analysis.created_at))
        .all()
    )
    trends = [TrendPoint(date=str(row.date), count=row.count) for row in trend_rows]

    # Recent analyses (last 5)
    recent = (
        base_query
        .order_by(Analysis.created_at.desc())
        .limit(5)
        .all()
    )
    recent_analyses = [
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
        for a in recent
    ]

    # Most flagged sources — domains with highest avg fake scores
    flagged_query = base_query.filter(Analysis.source_url.isnot(None))
    flagged_rows = (
        flagged_query.with_entities(
            Analysis.source_url,
            func.count(Analysis.id).label("count"),
            func.avg(Analysis.final_score).label("avg_score"),
        )
        .group_by(Analysis.source_url)
        .having(func.count(Analysis.id) >= 1)
        .order_by(func.avg(Analysis.final_score).desc())
        .limit(10)
        .all()
    )
    flagged_sources = []
    for row in flagged_rows:
        # Extract domain from URL
        url = row[0] or ""
        domain = url.split("//")[-1].split("/")[0].replace("www.", "") if url else "unknown"
        flagged_sources.append(
            FlaggedSource(domain=domain, count=row[1], avg_score=round(float(row[2]), 1))
        )

    return StatsResponse(
        total_analyses=total,
        verdict_distribution=verdict_distribution,
        trends=trends,
        recent_analyses=recent_analyses,
        flagged_sources=flagged_sources,
    )


@router.post(
    "/compare",
    response_model=CompareResponse,
    summary="Compare models side-by-side",
    response_description="Classification results from all available models with inference times",
    tags=["Analysis"],
)
async def compare_models(request: AnalyzeRequest):
    """Run the same text through all available models and compare results.

    Returns classification from RoBERTa, TF-IDF baseline, and inference time for each.
    """
    classifiers = get_classifier()
    if classifiers is None:
        raise HTTPException(status_code=503, detail="No models loaded")

    text = request.content
    models: list[ModelResult] = []

    # Run each available model
    for name, key in [("RoBERTa (Fine-tuned)", "primary"), ("TF-IDF + Logistic Regression", "fallback")]:
        clf = classifiers.get(key)
        if clf is None:
            models.append(ModelResult(
                model_name=name, verdict="N/A", confidence=0,
                fake_probability=0, real_probability=0,
                inference_time_ms=0, available=False,
            ))
            continue

        start = time.perf_counter()
        try:
            result = clf.predict(text)
            elapsed = (time.perf_counter() - start) * 1000
            models.append(ModelResult(
                model_name=name,
                verdict=result["verdict"],
                confidence=round(result["confidence"], 4),
                fake_probability=round(result["fake_probability"], 4),
                real_probability=round(result["real_probability"], 4),
                inference_time_ms=round(elapsed, 2),
            ))
        except Exception:
            elapsed = (time.perf_counter() - start) * 1000
            models.append(ModelResult(
                model_name=name, verdict="Error", confidence=0,
                fake_probability=0, real_probability=0,
                inference_time_ms=round(elapsed, 2), available=False,
            ))

    return CompareResponse(input_text=text, models=models)


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
        clickbait=ClickbaitResult(**result["clickbait"]) if result.get("clickbait") else None,
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
    cb = analysis.clickbait_data or {}

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
        clickbait=ClickbaitResult(**cb) if cb and cb.get("available") else None,
    )
