import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from app.core.config import settings
from app.core.exceptions import AppException
from app.api.v1.router import api_router
from app.db.base_class import Base
from app.db.session import engine, SessionLocal
from app.seed.seed_data import seed_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables and uploads directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    for sub in ["designs", "custom_requests", "customers", "orders", "services", "general"]:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, sub), exist_ok=True)

    try:
        Base.metadata.create_all(bind=engine)
        print("[*] Database tables verified & connected successfully.")
    except Exception as e:
        print(f"[!] Database connection notice during table creation: {e}")

    # Safe column migrations for SQLite
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("ALTER TABLE custom_requests ADD COLUMN notes TEXT;"))
            conn.commit()
    except Exception:
        pass

    # Seed on fresh start if database empty
    try:
        db = SessionLocal()
        seed_db(db)
        db.close()
    except Exception as e:
        print(f"[*] Seeding notice: {e}")

    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-Stack Boutique Tailoring & Women's Fashion Management REST API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware (Supports localhost & Mobile local network IPs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Global Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"success": False, "message": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err["loc"])
        errors.append(f"{field}: {err['msg']}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed on one or more request fields.",
            "errors": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": f"Internal server error: {str(exc)}" if settings.DEBUG else "An unexpected error occurred."
        }
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["System"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "api_docs": "/docs",
        "api_version": "v1"
    }

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
