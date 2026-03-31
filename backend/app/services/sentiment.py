"""Sentiment analysis + sensationalism scoring service."""

import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


_analyzer = SentimentIntensityAnalyzer()

# Sensationalism trigger words
SENSATIONAL_WORDS = {
    "shocking", "unbelievable", "horrifying", "outrageous", "breaking",
    "exclusive", "bombshell", "devastating", "explosive", "stunning",
    "terrifying", "urgent", "alarming", "incredible", "insane",
    "jaw-dropping", "mind-blowing", "scandalous", "controversial",
    "leaked", "exposed", "destroyed", "slammed", "blasted",
    "obliterated", "annihilated", "crushed", "demolished", "eviscerated",
    "you won't believe", "what they don't want you to know",
    "the truth about", "exposed", "cover-up", "conspiracy",
    "mainstream media won't tell you", "wake up", "sheeple",
}


def analyze_sentiment(text: str) -> dict:
    """Analyze text sentiment and sensationalism level.

    Returns:
        dict with sentiment scores and sensationalism score (0-1).
    """
    vader_scores = _analyzer.polarity_scores(text)
    sensationalism = _compute_sensationalism(text)

    # Higher sensationalism = more likely fake news signal
    # We combine absolute sentiment extremity + sensationalism
    sentiment_extremity = abs(vader_scores["compound"])

    # Weighted combination: sensationalism matters more than raw sentiment
    combined_score = 0.6 * sensationalism + 0.4 * sentiment_extremity

    return {
        "vader_compound": vader_scores["compound"],
        "vader_positive": vader_scores["pos"],
        "vader_negative": vader_scores["neg"],
        "vader_neutral": vader_scores["neu"],
        "sensationalism_score": round(sensationalism, 4),
        "sentiment_score": round(combined_score, 4),
    }


def _compute_sensationalism(text: str) -> float:
    """Score text sensationalism from 0 (neutral) to 1 (highly sensational)."""
    signals = []

    # 1. ALL CAPS words ratio (excluding short words like "I", "A")
    words = text.split()
    if words:
        caps_words = [w for w in words if w.isupper() and len(w) > 1]
        caps_ratio = len(caps_words) / len(words)
        signals.append(min(caps_ratio * 5, 1.0))  # Scale: 20% caps = 1.0

    # 2. Excessive punctuation (!!! or ???)
    exclamation_count = text.count("!")
    question_count = text.count("?")
    excessive_punct = (exclamation_count + question_count) / max(len(text), 1) * 100
    signals.append(min(excessive_punct * 2, 1.0))

    # 3. Sensational trigger words
    text_lower = text.lower()
    trigger_count = sum(1 for word in SENSATIONAL_WORDS if word in text_lower)
    signals.append(min(trigger_count / 3, 1.0))  # 3+ trigger words = 1.0

    # 4. Clickbait patterns
    clickbait_patterns = [
        r"\byou won't believe\b",
        r"\bwhat happens next\b",
        r"\bthis is why\b",
        r"\bnumber \d+ will\b",
        r"\bthey don't want you\b",
        r"\bthe truth about\b",
        r"\bhere's what\b.*\breally\b",
    ]
    clickbait_matches = sum(
        1 for p in clickbait_patterns if re.search(p, text_lower)
    )
    signals.append(min(clickbait_matches / 2, 1.0))

    if not signals:
        return 0.0

    return sum(signals) / len(signals)
