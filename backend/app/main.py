from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.prisma_client import prisma_lifespan
from app.routers.health import router as health_router
from app.routers.users import router as users_router
from app.routers.barangays import router as barangays_router
from app.routers.shelters import router as shelters_router
from app.routers.analytics import router as analytics_router


def create_app() -> FastAPI:
    app = FastAPI(title="SAGIP API", version="0.1.0", lifespan=prisma_lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(users_router, prefix="/api/users", tags=["users"])
    app.include_router(barangays_router, prefix="/api/barangays", tags=["barangays"])
    app.include_router(shelters_router, prefix="/api/shelters", tags=["shelters"])
    app.include_router(analytics_router, prefix="/api/analytics")

    return app


app = create_app()

