import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import check_db_health, init_db
from app.routes.auth import router as auth_router
from app.routes.semesters import router as semesters_router

FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS_ORIGINS: list[str] = [FRONTEND_URL, "https://*.vercel.app",]

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    yield

def create_app() -> FastAPI:
    app = FastAPI(
        title="GPA Calculator API",
        description="API for GPA Calculator - JNTUA grading system",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(semesters_router, prefix="/api/v1")

    @app.get("/health", tags=["Infrastructure"], include_in_schema=False)
    def health() -> JSONResponse:
        db_health = check_db_health()
        status_code = 200 if db_health else 503
        return JSONResponse(
            status_code=status_code,
            content={"status": "ok" if db_health else "unhealthy", "db": db_health},
        )
    return app

app = create_app()