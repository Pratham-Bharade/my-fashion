from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.customers import router as customers_router
from app.api.v1.services import router as services_router
from app.api.v1.designs import router as designs_router
from app.api.v1.measurements import router as measurements_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.custom_requests import router as custom_requests_router
from app.api.v1.quotations import router as quotations_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.contact import router as contact_router
from app.api.v1.business_settings import router as business_settings_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.ai import router as ai_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(customers_router)
api_router.include_router(services_router)
api_router.include_router(designs_router)
api_router.include_router(measurements_router)
api_router.include_router(appointments_router)
api_router.include_router(custom_requests_router)
api_router.include_router(quotations_router)
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(reviews_router)
api_router.include_router(notifications_router)
api_router.include_router(contact_router)
api_router.include_router(business_settings_router)
api_router.include_router(dashboard_router)
api_router.include_router(uploads_router)
api_router.include_router(ai_router)
