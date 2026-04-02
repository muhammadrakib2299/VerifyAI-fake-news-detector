"""Health check endpoint."""

from fastapi import APIRouter
from ..schemas import HealthResponse
from ..dependencies import get_classifier

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    response_description="Current service status and loaded model info",
)
async def health():
    """Check if the API is healthy and which ML model is loaded."""
    classifiers = get_classifier()
    model_loaded = classifiers is not None and classifiers.get("primary") is not None

    primary_model = None
    if model_loaded:
        primary = classifiers["primary"]
        primary_model = getattr(primary, "__class__", type(primary)).__name__

    return HealthResponse(
        status="healthy",
        model_loaded=model_loaded,
        primary_model=primary_model,
        version="0.3.0",
    )
