"""Shared dependencies — model loading and singleton access."""

from .services.classifier import load_classifiers, classify_text

_classifiers = None


def load_model():
    """Load all ML models at startup."""
    global _classifiers
    _classifiers = load_classifiers()

    if _classifiers["primary"] is None:
        print("WARNING: No classification model loaded. Run train_baseline.py or train_roberta.py first.")


def get_classifier():
    """Get the loaded classifiers dict."""
    return _classifiers


def get_prediction(text: str) -> dict:
    """Classify text using the best available model."""
    if _classifiers is None:
        raise RuntimeError("Models not loaded")
    return classify_text(_classifiers, text)
