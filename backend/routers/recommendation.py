from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import models
from database import get_db
from routers.auth import get_current_user
from services.recommendation import RecommendationService
from pydantic import BaseModel

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

class RecommendationOut(BaseModel):
    id: int
    type: str # 'question', 'video', 'tip', 'topic_focus'
    title: str
    description: str
    action_url: Optional[str]
    source: str
    priority: int

    class Config:
        from_attributes = True

@router.post("/generate")
async def generate_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Triggers the recommendation engine. 
    In production, this would be a background task (Celery).
    """
    service = RecommendationService(db, current_user.id)
    await service.generate_daily_recommendations()
    return {"status": "success", "message": "Recommendations generated"}

@router.get("", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get current valid recommendations for the user.
    """
    service = RecommendationService(db, current_user.id)
    recs = service.get_user_recommendations()
    return recs
