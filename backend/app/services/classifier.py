"""News classification service — RoBERTa primary + TF-IDF baseline fallback."""

import joblib
import torch
from pathlib import Path
from transformers import RobertaTokenizer, RobertaForSequenceClassification


class RoBERTaClassifier:
    """Fine-tuned RoBERTa model for fake news classification."""

    def __init__(self, model_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = RobertaTokenizer.from_pretrained(model_path)
        self.model = RobertaForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()

    def predict(self, text: str) -> dict:
        """Classify text as real or fake using RoBERTa."""
        inputs = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=256,
            return_tensors="pt",
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)[0]

        real_prob = float(probabilities[0])
        fake_prob = float(probabilities[1])

        if fake_prob >= 0.65:
            verdict = "Fake"
        elif fake_prob >= 0.35:
            verdict = "Misleading"
        else:
            verdict = "Real"

        return {
            "verdict": verdict,
            "confidence": max(fake_prob, real_prob),
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "model": "roberta",
        }


class BaselineClassifier:
    """TF-IDF + Logistic Regression fallback classifier."""

    def __init__(self, model_path: str):
        self.pipeline = joblib.load(model_path)

    def predict(self, text: str) -> dict:
        """Classify text as real or fake."""
        probabilities = self.pipeline.predict_proba([text])[0]
        fake_prob = float(probabilities[1])
        real_prob = float(probabilities[0])

        if fake_prob >= 0.65:
            verdict = "Fake"
        elif fake_prob >= 0.35:
            verdict = "Misleading"
        else:
            verdict = "Real"

        return {
            "verdict": verdict,
            "confidence": max(fake_prob, real_prob),
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "model": "baseline",
        }


def load_classifiers() -> dict:
    """Load all available classifiers.

    Returns dict with 'primary' and 'fallback' classifier instances.
    """
    ml_dir = Path(__file__).parent.parent.parent / "ml" / "models"
    classifiers = {"primary": None, "fallback": None}

    # Try loading RoBERTa (primary)
    roberta_path = ml_dir / "roberta-fakenews"
    if roberta_path.exists() and (roberta_path / "config.json").exists():
        try:
            classifiers["primary"] = RoBERTaClassifier(str(roberta_path))
            print(f"RoBERTa model loaded from {roberta_path}")
        except Exception as e:
            print(f"WARNING: Failed to load RoBERTa model: {e}")

    # Load baseline (fallback / always available)
    baseline_path = ml_dir / "baseline_tfidf_logreg.joblib"
    if baseline_path.exists():
        try:
            classifiers["fallback"] = BaselineClassifier(str(baseline_path))
            print(f"Baseline model loaded from {baseline_path}")
        except Exception as e:
            print(f"WARNING: Failed to load baseline model: {e}")

    # If no RoBERTa, promote baseline to primary
    if classifiers["primary"] is None and classifiers["fallback"] is not None:
        classifiers["primary"] = classifiers["fallback"]
        print("Using baseline model as primary (RoBERTa not available)")

    return classifiers


def classify_text(classifiers: dict, text: str) -> dict:
    """Classify text using best available model.

    Tries primary (RoBERTa) first, falls back to baseline.
    """
    primary = classifiers.get("primary")
    fallback = classifiers.get("fallback")

    if primary is not None:
        try:
            return primary.predict(text)
        except Exception as e:
            print(f"Primary model failed: {e}, trying fallback...")

    if fallback is not None:
        return fallback.predict(text)

    raise RuntimeError("No classification model available")
