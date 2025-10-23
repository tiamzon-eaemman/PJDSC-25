from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.prisma_client import prisma_lifespan
from app.routers.health import router as health_router
from app.routers.hazards import router as hazards_router
from app.routers.barangays import router as barangays_router
from app.routers.evacuation import router as evacuation_router


def create_app() -> FastAPI:
    app = FastAPI(title="SAGIP GIS API", version="0.1.0", lifespan=prisma_lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(hazards_router, prefix="/api/hazards", tags=["hazards"])
    app.include_router(barangays_router, prefix="/api/barangays", tags=["barangays"])
    app.include_router(evacuation_router, prefix="/api/evacuation", tags=["evacuation"])

    return app


app = create_app()