"""Analysis endpoints."""

from fastapi import APIRouter, HTTPException
from ..schemas import AnalyzeRequest, AnalyzeResponse
from ..dependencies import get_classifier, get_prediction

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """Analyze text, URL, or claim for fake news."""
    classifiers = get_classifier()

    if classifiers is None or classifiers.get("primary") is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        result = get_prediction(request.content)
        return AnalyzeResponse(
            verdict=result["verdict"],
            confidence=result["confidence"],
            fake_probability=result["fake_probability"],
            real_probability=result["real_probability"],
            input_text=request.content,
            input_type=request.input_type.value,
            model_used=result.get("model", "baseline"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
