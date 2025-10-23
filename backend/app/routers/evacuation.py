from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.prisma_client import prisma


class EvacuationCenterCreate(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    capacity: Optional[int] = None
    barangayId: Optional[int] = None


class EvacuationCenterOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    capacity: Optional[int] = None
    barangayId: Optional[int] = None


router = APIRouter()


@router.get("/", response_model=List[EvacuationCenterOut])
async def list_evacuation_centers():
    centers = await prisma.evacuationcenter.find_many()
    return [
        EvacuationCenterOut(
            id=e.id,
            name=e.name,
            address=e.address,
            latitude=e.latitude,
            longitude=e.longitude,
            capacity=e.capacity,
            barangayId=e.barangayId
        )
        for e in centers
    ]


@router.post("/", response_model=EvacuationCenterOut, status_code=201)
async def create_evacuation_center(center: EvacuationCenterCreate):
    e = await prisma.evacuationcenter.create(data=center.model_dump())
    return EvacuationCenterOut(
        id=e.id,
        name=e.name,
        address=e.address,
        latitude=e.latitude,
        longitude=e.longitude,
        capacity=e.capacity,
        barangayId=e.barangayId
    )


@router.get("/geojson")
async def get_evacuation_centers_geojson():
    """Get evacuation centers as GeoJSON for GIS display"""
    centers = await prisma.evacuationcenter.find_many()
    
    features = []
    for e in centers:
        feature = {
            "type": "Feature",
            "properties": {
                "id": e.id,
                "name": e.name,
                "address": e.address,
                "capacity": e.capacity,
                "barangayId": e.barangayId
            },
            "geometry": {
                "type": "Point",
                "coordinates": [e.longitude, e.latitude]
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }
