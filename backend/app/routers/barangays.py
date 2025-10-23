from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.prisma_client import prisma


class BarangayCreate(BaseModel):
    name: str
    municipality: str
    province: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BarangayOut(BaseModel):
    id: int
    name: str
    municipality: str
    province: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


router = APIRouter()


@router.get("/", response_model=List[BarangayOut])
async def list_barangays():
    barangays = await prisma.barangay.find_many()
    return [
        BarangayOut(
            id=b.id,
            name=b.name,
            municipality=b.municipality,
            province=b.province,
            latitude=b.latitude,
            longitude=b.longitude
        )
        for b in barangays
    ]


@router.post("/", response_model=BarangayOut, status_code=201)
async def create_barangay(barangay: BarangayCreate):
    b = await prisma.barangay.create(data=barangay.model_dump())
    return BarangayOut(
        id=b.id,
        name=b.name,
        municipality=b.municipality,
        province=b.province,
        latitude=b.latitude,
        longitude=b.longitude
    )


@router.get("/geojson")
async def get_barangays_geojson():
    """Get barangays as GeoJSON for GIS display"""
    barangays = await prisma.barangay.find_many()
    
    features = []
    for b in barangays:
        if b.latitude and b.longitude:
            feature = {
                "type": "Feature",
                "properties": {
                    "id": b.id,
                    "name": b.name,
                    "municipality": b.municipality,
                    "province": b.province
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [b.longitude, b.latitude]
                }
            }
            features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }
