"""Explainability service — LIME word-level importance + Claude API explanations."""

import numpy as np
from lime.lime_text import LimeTextExplainer
from .classifier import classify_text


# Reusable LIME explainer instance
_lime_explainer = LimeTextExplainer(
    class_names=["Real", "Fake"],
    split_expression=r"\W+",
    bow=True,
)


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
        # LIME needs a function that takes a list of texts -> probability array
        def predict_fn(texts: list[str]) -> np.ndarray:
            results = []
            for t in texts:
                pred = classify_text(classifiers, t)
                results.append([pred["real_probability"], pred["fake_probability"]])
            return np.array(results)

        explanation = _lime_explainer.explain_instance(
            text,
            predict_fn,
            num_features=num_features,
            num_samples=num_samples,
        )

        # Extract word-level importances
        word_importances = explanation.as_list()

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
