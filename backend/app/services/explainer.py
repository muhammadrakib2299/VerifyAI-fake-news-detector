"""Explainability service — LIME word-level importance + Claude API explanations."""

import numpy as np
from .classifier import classify_text
from ..config import settings


# Lazy-initialized LIME explainer (lime imports sklearn internals which is slow)
_lime_explainer = None


def _get_lime_explainer():
    global _lime_explainer
    if _lime_explainer is None:
        from lime.lime_text import LimeTextExplainer
        _lime_explainer = LimeTextExplainer(
            class_names=["Real", "Fake"],
            split_expression=r"\W+",
            bow=True,
        )
    return _lime_explainer


def generate_lime_explanation(
    text: str,
    classifiers: dict,
    num_features: int = 15,
    num_samples: int = 300,
) -> dict:
    """Generate LIME word-level feature importance for a classification.

    Args:
        text: The text that was classified.
        classifiers: Dict with 'primary' and 'fallback' classifiers.
        num_features: Number of top features to return.
        num_samples: Number of perturbed samples LIME uses (lower = faster).

    Returns:
        Dict with highlights (word importances) and summary stats.
    """
    try:
        # LIME requires a predict_fn(list[str]) -> ndarray(n, 2) interface.
        # It generates perturbed versions of the input text by randomly removing
        # words, then observes how predictions change to assign word importance.
        def predict_fn(texts: list[str]) -> np.ndarray:
            results = []
            for t in texts:
                pred = classify_text(classifiers, t)
                results.append([pred["real_probability"], pred["fake_probability"]])
            return np.array(results)

        explanation = _get_lime_explainer().explain_instance(
            text,
            predict_fn,
            num_features=num_features,
            num_samples=num_samples,
        )

        # Extract word-level importances
        word_importances = explanation.as_list()

        # LIME weights: positive = contributes toward class 1 (Fake),
        # negative = contributes toward class 0 (Real)
        highlights = []
        for word, weight in word_importances:
            highlights.append({
                "text": word,
                "weight": round(float(weight), 4),
                "signal": "fake" if weight > 0 else "real",
            })

        # Sort by absolute weight (most important first)
        highlights.sort(key=lambda h: abs(h["weight"]), reverse=True)

        return {
            "highlights": highlights,
            "method": "lime",
            "num_features": num_features,
            "num_samples": num_samples,
            "available": True,
        }

    except Exception as e:
        print(f"LIME explanation failed: {e}")
        return {
            "highlights": [],
            "method": "lime",
            "num_features": 0,
            "num_samples": 0,
            "available": False,
            "error": str(e),
        }


async def generate_claude_explanation(
    text: str,
    verdict: str,
    confidence: float,
    classification: dict,
    sentiment: dict,
    credibility: dict,
    fact_check: dict,
    highlights: list[dict],
) -> str | None:
    """Generate a natural-language explanation using Claude API.

    Args:
        text: The analyzed text (truncated).
        verdict: The final verdict (Real/Misleading/Fake).
        confidence: Confidence score 0-1.
        classification: Classification sub-scores.
        sentiment: Sentiment sub-scores.
        credibility: Credibility sub-scores.
        fact_check: Fact-check sub-scores.
        highlights: LIME word-level highlights.

    Returns:
        Natural language explanation string, or None if unavailable.
    """
    if not settings.anthropic_api_key:
        return None

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        # Build the top keywords summary from LIME highlights
        fake_words = [h["text"] for h in highlights if h["signal"] == "fake"][:5]
        real_words = [h["text"] for h in highlights if h["signal"] == "real"][:5]

        prompt = f"""You are an AI fact-checking assistant. Analyze why this article/claim received the verdict below.

TEXT (first 500 chars):
{text[:500]}

ANALYSIS RESULTS:
- Verdict: {verdict} (confidence: {confidence:.0%})
- AI Classification: {classification.get('fake_probability', 0):.0%} fake probability
- Sensationalism Score: {sentiment.get('sensationalism_score', 0):.0%}
- Sentiment: {sentiment.get('vader_compound', 0):.2f} (VADER compound)
- Source Credibility: {credibility.get('credibility_level', 'unknown')} ({credibility.get('domain', 'N/A')})
- Fact-Check Matches: {fact_check.get('match_count', 0)}

KEY WORDS FLAGGED:
- Words suggesting fake: {', '.join(fake_words) if fake_words else 'none'}
- Words suggesting real: {', '.join(real_words) if real_words else 'none'}

Write a concise 3-4 sentence explanation of why this content received the "{verdict}" verdict. Reference specific evidence from the scores and flagged words. Be objective and informative. Do not use markdown formatting."""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )

        return message.content[0].text.strip()

    except Exception as e:
        print(f"Claude explanation failed: {e}")
        return None
