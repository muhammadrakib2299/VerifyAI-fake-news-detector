"""Language detection service.

Uses character frequency and common word heuristics for lightweight
language detection without external dependencies.
"""

import re
from collections import Counter

# Common words per language (top frequent words)
LANGUAGE_MARKERS = {
    "en": {
        "the", "is", "are", "was", "were", "have", "has", "had", "will",
        "would", "could", "should", "been", "being", "this", "that", "with",
        "from", "they", "their", "which", "about", "into", "more", "than",
        "just", "also", "said", "people", "after", "because",
    },
    "es": {
        "el", "la", "los", "las", "de", "en", "que", "por", "con", "una",
        "del", "para", "como", "pero", "más", "fue", "este", "esta", "ser",
        "se", "no", "es", "al", "lo", "su", "han", "son", "muy", "tiene",
    },
    "fr": {
        "le", "la", "les", "de", "des", "du", "un", "une", "en", "et",
        "est", "que", "qui", "dans", "pour", "pas", "sur", "sont", "avec",
        "ce", "cette", "mais", "plus", "par", "son", "ils", "elle", "ont",
    },
    "de": {
        "der", "die", "das", "und", "ist", "von", "den", "mit", "ein",
        "eine", "auf", "dem", "für", "nicht", "sich", "auch", "als",
        "noch", "nach", "über", "bei", "wie", "aus", "sie", "wird",
    },
    "pt": {
        "de", "que", "não", "em", "para", "com", "uma", "os", "no",
        "se", "na", "por", "mais", "como", "dos", "ou", "tem", "ao",
        "seu", "sua", "ele", "das", "foi", "são", "mas", "está",
    },
    "it": {
        "di", "che", "il", "la", "per", "non", "una", "con", "del",
        "sono", "da", "alla", "più", "nel", "dei", "dalla", "anche",
        "sul", "gli", "suo", "questa", "stato", "tra", "essere",
    },
    "ar": set(),  # Arabic detection uses script
    "zh": set(),  # Chinese detection uses script
    "hi": set(),  # Hindi detection uses script
    "ja": set(),  # Japanese detection uses script
    "ko": set(),  # Korean detection uses script
    "ru": set(),  # Russian detection uses script
}

# Unicode script ranges for script-based detection
SCRIPT_RANGES = {
    "ar": [(0x0600, 0x06FF), (0x0750, 0x077F), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)],
    "zh": [(0x4E00, 0x9FFF), (0x3400, 0x4DBF)],
    "hi": [(0x0900, 0x097F)],
    "ja": [(0x3040, 0x309F), (0x30A0, 0x30FF), (0x4E00, 0x9FFF)],
    "ko": [(0xAC00, 0xD7AF), (0x1100, 0x11FF)],
    "ru": [(0x0400, 0x04FF)],
}


def detect_language(text: str) -> dict:
    """Detect the language of the given text.

    Returns:
        Dict with language code, name, confidence, and method used.
    """
    if not text or len(text.strip()) < 10:
        return {
            "code": "en",
            "name": "English",
            "confidence": 0.5,
            "method": "default",
        }

    # First check for non-Latin scripts
    script_result = _detect_by_script(text)
    if script_result:
        return script_result

    # For Latin-script languages, use word frequency
    return _detect_by_words(text)


def _detect_by_script(text: str) -> dict | None:
    """Detect language by Unicode script ranges."""
    script_counts = Counter()
    total_chars = 0

    for char in text:
        code = ord(char)
        if code < 128:
            continue  # Skip ASCII
        total_chars += 1
        for lang, ranges in SCRIPT_RANGES.items():
            for start, end in ranges:
                if start <= code <= end:
                    script_counts[lang] += 1
                    break

    if total_chars < 5:
        return None

    if not script_counts:
        return None

    best_lang, count = script_counts.most_common(1)[0]
    confidence = min(0.95, count / total_chars)

    if confidence < 0.3:
        return None

    return {
        "code": best_lang,
        "name": LANGUAGE_NAMES.get(best_lang, best_lang),
        "confidence": round(confidence, 3),
        "method": "script",
    }


def _detect_by_words(text: str) -> dict:
    """Detect language using common word frequency matching."""
    words = set(re.findall(r'[a-zà-ÿ]+', text.lower()))

    if not words:
        return {
            "code": "en",
            "name": "English",
            "confidence": 0.5,
            "method": "default",
        }

    scores = {}
    for lang, markers in LANGUAGE_MARKERS.items():
        if not markers:
            continue
        overlap = words & markers
        scores[lang] = len(overlap) / len(markers) if markers else 0

    if not scores:
        return {
            "code": "en",
            "name": "English",
            "confidence": 0.5,
            "method": "default",
        }

    best_lang = max(scores, key=scores.get)
    best_score = scores[best_lang]

    # Require minimum confidence
    if best_score < 0.05:
        return {
            "code": "en",
            "name": "English",
            "confidence": 0.5,
            "method": "default",
        }

    return {
        "code": best_lang,
        "name": LANGUAGE_NAMES.get(best_lang, best_lang),
        "confidence": round(min(0.95, best_score * 3), 3),
        "method": "word_frequency",
    }


LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "ar": "Arabic",
    "zh": "Chinese",
    "hi": "Hindi",
    "ja": "Japanese",
    "ko": "Korean",
    "ru": "Russian",
}
