from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.services.ai_service import ai_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/ai", tags=["AI Stylist & Assistant"])

class ChatQuery(BaseModel):
    query: str

@router.post("/chat", response_model=ApiResponse[dict])
def chat_with_stylist(
    payload: ChatQuery,
    db: Session = Depends(get_db)
):
    """
    Virtual AI boutique assistant for customer questions about stitching, design ideas, prices, and booking.
    """
    result = ai_service.answer_customer_query(db=db, query=payload.query)
    return ApiResponse(success=True, data=result)

@router.get("/recommendations", response_model=ApiResponse[List[dict]])
def get_design_recommendations(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Recommends matching boutique designs based on preferred garment style or occasion.
    """
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    recommendations = ai_service.recommend_similar_designs(db=db, category=category, tags=tag_list)
    return ApiResponse(success=True, data=recommendations)
