"""Analysis pipeline — orchestrates all services with weighted scoring."""

import uuid
from datetime import datetime, timezone
from .classifier import classify_text
from .sentiment import analyze_sentiment
from .credibility import check_credibility, check_credibility_from_domain
from .scraper import scrape_article
from .fact_checker import check_facts
from .explainer import generate_lime_explanation, generate_claude_explanation
from .clickbait import detect_clickbait
from .language import detect_language


# Weighted scoring formula
WEIGHTS = {
    "classification": 0.45,
    "sentiment": 0.20,
    "credibility": 0.20,
    "fact_check": 0.15,
}

# Verdict thresholds (on 0-100 scale)
VERDICT_THRESHOLDS = {
    "real": 30,       # 0-30 = Real
    "misleading": 65,  # 30-65 = Misleading
    # 65-100 = Fake
}


async def run_pipeline(
    content: str,
    input_type: str,
    classifiers: dict,
) -> dict:
    """Run the full analysis pipeline.

    Args:
        content: Text, URL, or claim to analyze.
        input_type: One of "text", "url", "claim".
        classifiers: Dict with 'primary' and 'fallback' classifier instances.

    Returns:
        Full analysis result with all sub-scores and evidence.
    """
    analysis_id = str(uuid.uuid4())
    text_to_analyze = content
    source_url = None
    scrape_result = None

    # If URL input, scrape the article first
    if input_type == "url":
        source_url = content
        scrape_result = scrape_article(content)
        if scrape_result["success"] and scrape_result["text"]:
            text_to_analyze = scrape_result["text"]
        else:
            # Fall back to analyzing the URL string itself
            text_to_analyze = content

    # 0a. Language detection
    language = detect_language(text_to_analyze)

    # 0b. Clickbait detection (if we have a headline from scraping)
    headline = scrape_result["title"] if scrape_result and scrape_result.get("title") else None
    clickbait = detect_clickbait(headline, text_to_analyze)

    # 1. Classification (use multilingual model for non-English if available)
    if language["code"] != "en" and classifiers.get("multilingual") is not None:
        classification = classifiers["multilingual"].predict(text_to_analyze)
    else:
        classification = classify_text(classifiers, text_to_analyze)

    # 2. Sentiment analysis
    sentiment = analyze_sentiment(text_to_analyze)

    # 3. Source credibility (if URL provided)
    credibility = None
    if source_url:
        credibility = check_credibility(source_url)
    elif scrape_result and scrape_result.get("source_domain"):
        credibility = check_credibility_from_domain(scrape_result["source_domain"])

    # 4. Fact check (async)
    # Use the first 200 chars or the claim as search query
    fact_query = text_to_analyze[:200] if input_type != "claim" else content
    fact_check = await check_facts(fact_query)

    # 5. Explainability (LIME word-level importance)
    explainability = generate_lime_explanation(text_to_analyze, classifiers)

    # Calculate weighted final score (0-100, higher = more likely fake)
    final_score = _calculate_final_score(
        classification, sentiment, credibility, fact_check
    )

    # Map to verdict
    verdict = _score_to_verdict(final_score)

    # 6. Claude explanation (async, uses all analysis results)
    claude_explanation = await generate_claude_explanation(
        text=text_to_analyze,
        verdict=verdict,
        confidence=classification["confidence"],
        classification=classification,
        sentiment=sentiment,
        credibility=credibility if credibility else {},
        fact_check=fact_check,
        highlights=explainability.get("highlights", []),
    )

    return {
        "id": analysis_id,
        "verdict": verdict,
        "confidence": classification["confidence"],
        "final_score": final_score,
        "input_text": content,
        "analyzed_text": text_to_analyze[:500],  # Truncate for response
        "input_type": input_type,
        "model_used": classification["model"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        # Sub-scores
        "classification": {
            "verdict": classification["verdict"],
            "fake_probability": classification["fake_probability"],
            "real_probability": classification["real_probability"],
            "model": classification["model"],
        },
        "sentiment": {
            "vader_compound": sentiment["vader_compound"],
            "sensationalism_score": sentiment["sensationalism_score"],
            "sentiment_score": sentiment["sentiment_score"],
        },
        "credibility": credibility if credibility else {
            "domain": None,
            "score": 50,
            "credibility_level": "not_applicable",
            "category": "not_applicable",
            "bias": "not_applicable",
            "is_flagged": False,
            "in_database": False,
            "credibility_score": 0.5,
        },
        "fact_check": {
            "has_matches": fact_check["has_matches"],
            "match_count": fact_check["match_count"],
            "matches": fact_check.get("matches", []),
            "fact_check_score": fact_check["fact_check_score"],
            "api_available": fact_check.get("api_available", False),
        },
        "explainability": {
            "highlights": explainability.get("highlights", []),
            "explanation": claude_explanation,
            "method": explainability.get("method", "lime"),
            "available": explainability.get("available", False),
        },
        "clickbait": clickbait,
        "language": language,
        # Scraped article info (if applicable)
        "article_info": {
            "title": scrape_result["title"] if scrape_result else None,
            "authors": scrape_result["authors"] if scrape_result else [],
            "publish_date": scrape_result["publish_date"] if scrape_result else None,
            "source_domain": scrape_result["source_domain"] if scrape_result else None,
        } if scrape_result else None,
    }


def _calculate_final_score(
    classification: dict,
    sentiment: dict,
    credibility: dict | None,
    fact_check: dict,
) -> float:
    """Calculate weighted final score (0-100).

    Higher score = more likely fake news.
    """
    # Classification score (fake_probability already 0-1)
    class_score = classification["fake_probability"] * 100

    # Sentiment score (combined sentiment_score is 0-1)
    sent_score = sentiment["sentiment_score"] * 100

    # Credibility score (credibility_score is 0-1, where 1 = not credible)
    if credibility:
        cred_score = credibility["credibility_score"] * 100
    else:
        cred_score = 50  # Neutral when no URL

    # Fact-check score (0-1, where 1 = confirmed false)
    fc_score = fact_check["fact_check_score"] * 100

    # Adjust weights if credibility not available
    if credibility is None:
        # Redistribute credibility weight to classification and sentiment
        w = {
            "classification": 0.55,
            "sentiment": 0.25,
            "credibility": 0.0,
            "fact_check": 0.20,
        }
    else:
        w = WEIGHTS

    final = (
        w["classification"] * class_score
        + w["sentiment"] * sent_score
        + w["credibility"] * cred_score
        + w["fact_check"] * fc_score
    )

    return round(min(max(final, 0), 100), 2)


def _score_to_verdict(score: float) -> str:
    """Map final score to verdict string."""
    if score < VERDICT_THRESHOLDS["real"]:
        return "Real"
    elif score < VERDICT_THRESHOLDS["misleading"]:
        return "Misleading"
    else:
        return "Fake"
