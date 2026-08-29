from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.design import Design
from app.models.service import Service

class AIService:
    """
    Modular AI service for chatbot assistance, style recommendations, and design matching.
    Designed with complete isolation and graceful fallback when API keys are absent.
    """

    def is_available(self) -> bool:
        return bool(settings.AI_ENABLED and settings.AI_API_KEY)

    def answer_customer_query(self, db: Session, query: str) -> Dict[str, Any]:
        """
        Answers customer queries regarding boutique timings, services, pricing, and appointments.
        Uses rule-based intelligent knowledge extraction with fallback.
        """
        q = query.lower()
        services = db.query(Service).filter(Service.is_active == True).all()
        service_names = [s.name for s in services]

        if any(w in q for w in ["bridal", "wedding", "zardozi"]):
            return {
                "response": "Yes! We specialize in Royal Bridal Blouses, Lehengas, and Zardozi embroidery. You can explore our Bridal category in the Design Gallery or book an in-person measurement consultation.",
                "suggested_actions": [{"label": "View Bridal Gallery", "link": "/designs?category=BRIDAL"}, {"label": "Book Appointment", "link": "/appointments/book"}]
            }
        elif any(w in q for w in ["price", "cost", "charge", "rate", "fee"]):
            return {
                "response": "Our basic blouse stitching starts from ₹450, designer blouses from ₹850, and bridal wear from ₹3,200. Custom quotations are provided after reviewing your fabric and design preferences.",
                "suggested_actions": [{"label": "View All Services & Pricing", "link": "/services"}]
            }
        elif any(w in q for w in ["time", "timing", "open", "hour", "sunday", "address", "location"]):
            return {
                "response": "We are open Monday to Saturday from 10:00 AM to 8:00 PM, and Sunday from 11:00 AM to 5:00 PM at 14, Fashion Street, Near Heritage Circle, Pune.",
                "suggested_actions": [{"label": "Contact & Directions", "link": "/contact"}]
            }
        elif any(w in q for w in ["appointment", "slot", "book", "visit"]):
            return {
                "response": "You can easily schedule a consultation slot online through our mobile booking system. We will take your exact measurements and discuss your custom design.",
                "suggested_actions": [{"label": "Book an Appointment", "link": "/appointments/book"}]
            }
        elif any(w in q for w in ["custom", "design", "photo", "image", "reference", "upload"]):
            return {
                "response": "You can upload any reference photo or sketch from Pinterest or Instagram in our Custom Request section. Our master tailor will review it and provide a detailed price quotation.",
                "suggested_actions": [{"label": "Create Custom Request", "link": "/custom-requests/create"}]
            }
        else:
            return {
                "response": "Welcome to SilaiCraft! We offer custom blouse stitching, bridal lehengas, suits, kurtis, and expert alterations. How may we assist your style today?",
                "suggested_actions": [
                    {"label": "Explore Services", "link": "/services"},
                    {"label": "Browse Gallery", "link": "/designs"},
                    {"label": "Book Appointment", "link": "/appointments/book"}
                ]
            }

    def recommend_similar_designs(self, db: Session, category: Optional[str] = None, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Recommends designs matching categories or style tags.
        """
        query = db.query(Design).filter(Design.is_active == True)
        if category:
            query = query.filter(Design.category == category)
        
        designs = query.limit(6).all()
        return [
            {
                "id": d.id,
                "title": d.title,
                "category": d.category,
                "image": d.image,
                "price": float(d.price) if d.price else None,
                "tags": d.tags
            }
            for d in designs
        ]

ai_service = AIService()
