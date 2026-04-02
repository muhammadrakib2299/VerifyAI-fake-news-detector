"""Clickbait detector — compares headline semantics vs article body.

Uses TF-IDF cosine similarity to measure semantic mismatch between
headline and body text. High mismatch indicates potential clickbait.
Also checks for common clickbait language patterns.
"""

import re
import math
from collections import Counter

# Common clickbait trigger patterns
CLICKBAIT_PATTERNS = [
    r"\byou won'?t believe\b",
    r"\bshocking\b",
    r"\bthis is why\b",
    r"\bwhat happens next\b",
    r"\bnumber \d+ will\b",
    r"\b\d+ reasons?\b",
    r"\b\d+ things?\b",
    r"\bthe truth about\b",
    r"\bwhat .+ doesn'?t want you to know\b",
    r"\bexperts? (are )?shocked\b",
    r"\bhate (him|her|them)\b",
    r"\bone weird trick\b",
    r"\byou'?ll never guess\b",
    r"\bis this the end\b",
    r"\bbreaking:?\b",
    r"\burgent:?\b",
    r"\bjust in:?\b",
]

# Compiled patterns for efficiency
_compiled_patterns = [re.compile(p, re.IGNORECASE) for p in CLICKBAIT_PATTERNS]


def detect_clickbait(headline: str | None, body: str) -> dict:
    """Detect clickbait by comparing headline vs body semantics.

    Args:
        headline: Article headline/title (None if not available).
        body: Article body text.

    Returns:
        Dict with mismatch_score (0-100), clickbait_score, and analysis details.
    """
    if not headline or not body or len(body.strip()) < 50:
        return {
            "available": False,
            "mismatch_score": 0,
            "clickbait_score": 0.0,
            "pattern_matches": [],
            "similarity": None,
            "headline": headline,
        }

    # 1. Semantic similarity between headline and body
    similarity = _cosine_similarity_tfidf(headline, body)

    # Mismatch: lower similarity = higher mismatch.
    # Typical article: similarity 0.05-0.3 (headline reuses some body terms)
    # Clickbait: similarity < 0.02 (headline unrelated to body)
    # The 5x scaling maps the 0-0.2 similarity range to 0-100 mismatch:
    #   similarity=0.0 → mismatch=100, similarity=0.2 → mismatch=0
    mismatch_score = max(0, min(100, (1 - similarity * 5) * 100))

    # 2. Clickbait language patterns in headline
    pattern_matches = []
    for pattern in _compiled_patterns:
        match = pattern.search(headline)
        if match:
            pattern_matches.append(match.group())

    pattern_score = min(1.0, len(pattern_matches) * 0.3)

    # 3. Headline style signals
    style_score = _check_headline_style(headline)

    # Combined clickbait score (0-1):
    # Semantic mismatch weighted highest (45%) since it's the strongest signal.
    # Language patterns (30%) catch explicit clickbait phrases.
    # Style (25%) catches formatting cues (caps, punctuation, questions).
    clickbait_score = (
        0.45 * (mismatch_score / 100)  # Semantic mismatch
        + 0.30 * pattern_score            # Clickbait language
        + 0.25 * style_score              # Style signals
    )
    clickbait_score = round(min(1.0, clickbait_score), 4)

    return {
        "available": True,
        "mismatch_score": round(mismatch_score, 1),
        "clickbait_score": clickbait_score,
        "pattern_matches": pattern_matches,
        "similarity": round(similarity, 4),
        "headline": headline,
    }


def _check_headline_style(headline: str) -> float:
    """Check headline for clickbait style signals.

    Returns a score 0-1 based on stylistic indicators.
    """
    signals = 0.0
    total_checks = 5

    # Excessive punctuation (!! or ??)
    if re.search(r'[!?]{2,}', headline):
        signals += 1

    # ALL CAPS words (more than 1)
    caps_words = len([w for w in headline.split() if w.isupper() and len(w) > 1])
    if caps_words >= 2:
        signals += 1

    # Starts with number + listicle pattern
    if re.match(r'^\d+\s', headline):
        signals += 0.5

    # Very short headline with emotional words
    emotional = ["amazing", "incredible", "insane", "unbelievable", "horrifying",
                 "terrifying", "heartbreaking", "devastating", "hilarious"]
    if any(w in headline.lower() for w in emotional):
        signals += 1

    # Question headline (often clickbait)
    if headline.strip().endswith('?'):
        signals += 0.5

    return min(1.0, signals / total_checks)


def _cosine_similarity_tfidf(text_a: str, text_b: str) -> float:
    """Calculate TF-IDF cosine similarity between two texts.

    Lightweight implementation without external dependencies.
    """
    # Tokenize
    tokens_a = _tokenize(text_a)
    tokens_b = _tokenize(text_b)

    if not tokens_a or not tokens_b:
        return 0.0

    # Build vocabulary
    vocab = set(tokens_a) | set(tokens_b)

    # TF for each document
    tf_a = Counter(tokens_a)
    tf_b = Counter(tokens_b)

    # IDF (simple: 2 documents)
    doc_count = {}
    for word in vocab:
        doc_count[word] = (1 if word in tf_a else 0) + (1 if word in tf_b else 0)

    # TF-IDF vectors
    vec_a = {}
    vec_b = {}
    for word in vocab:
        # Smoothed IDF: +1 prevents zero IDF for words in both docs
        idf = math.log(2.0 / doc_count[word]) + 1
        vec_a[word] = (tf_a.get(word, 0) / len(tokens_a)) * idf
        vec_b[word] = (tf_b.get(word, 0) / len(tokens_b)) * idf

    # Cosine similarity
    dot_product = sum(vec_a.get(w, 0) * vec_b.get(w, 0) for w in vocab)
    norm_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    norm_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def _tokenize(text: str) -> list[str]:
    """Simple word tokenizer with lowercasing and stopword removal."""
    # Common English stopwords
    stopwords = {
        "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought",
        "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "as", "into", "through", "during", "before", "after", "above", "below",
        "between", "out", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "each",
        "every", "both", "few", "more", "most", "other", "some", "such", "no",
        "not", "only", "own", "same", "so", "than", "too", "very", "just",
        "because", "but", "and", "or", "if", "while", "about", "up",
        "it", "its", "this", "that", "these", "those", "i", "me", "my",
        "we", "our", "you", "your", "he", "him", "his", "she", "her",
        "they", "them", "their", "what", "which", "who", "whom",
    }

    words = re.findall(r'[a-z]+', text.lower())
    return [w for w in words if w not in stopwords and len(w) > 1]
