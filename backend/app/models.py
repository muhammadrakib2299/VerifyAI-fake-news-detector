"""SQLAlchemy database models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, Boolean, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Analysis(Base):
    """Stores each fake news analysis result."""
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # User (nullable — public analyses don't require login)
    user_id = Column(String(255), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)

    # Input
    input_text = Column(Text, nullable=False)
    input_type = Column(String(20), nullable=False)  # text, url, claim
    source_url = Column(String(2048), nullable=True)

    # Verdict
    verdict = Column(String(20), nullable=False)  # Real, Misleading, Fake
    final_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_used = Column(String(50), nullable=False)

    # Sub-scores (stored as JSON for flexibility)
    classification_data = Column(JSON, nullable=True)
    sentiment_data = Column(JSON, nullable=True)
    credibility_data = Column(JSON, nullable=True)
    fact_check_data = Column(JSON, nullable=True)
    explainability_data = Column(JSON, nullable=True)
    clickbait_data = Column(JSON, nullable=True)
    language_data = Column(JSON, nullable=True)
    article_info = Column(JSON, nullable=True)

    # Analyzed text (may differ from input if URL was scraped)
    analyzed_text = Column(Text, nullable=True)

    # Relationships
    feedbacks = relationship("Feedback", back_populates="analysis", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "input_text": self.input_text,
            "input_type": self.input_type,
            "source_url": self.source_url,
            "verdict": self.verdict,
            "final_score": self.final_score,
            "confidence": self.confidence,
            "model_used": self.model_used,
            "classification": self.classification_data,
            "sentiment": self.sentiment_data,
            "credibility": self.credibility_data,
            "fact_check": self.fact_check_data,
            "explainability": self.explainability_data,
            "article_info": self.article_info,
            "analyzed_text": self.analyzed_text,
        }


class Feedback(Base):
    """Stores user corrections on analysis results."""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    is_correct = Column(Boolean, nullable=False)
    user_verdict = Column(String(20), nullable=True)  # What user thinks the correct verdict is
    comment = Column(Text, nullable=True)

    # Relationship
    analysis = relationship("Analysis", back_populates="feedbacks")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "analysis_id": self.analysis_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_correct": self.is_correct,
            "user_verdict": self.user_verdict,
            "comment": self.comment,
        }
