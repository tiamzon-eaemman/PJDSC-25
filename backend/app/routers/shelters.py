from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.core.prisma_client import prisma


class ShelterCreate(BaseModel):
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    barangayId: int


class ShelterOut(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None
    barangayId: int


router = APIRouter()


@router.get("/", response_model=List[ShelterOut])
async def list_shelters():
    shelters = await prisma.shelter.find_many()
    return [
        ShelterOut(
            id=s.id,
            name=s.name,
            address=s.address,
            latitude=s.latitude,
            longitude=s.longitude,
            capacity=s.capacity,
            barangayId=s.barangayId,
        )
        for s in shelters
    ]


@router.post("/", response_model=ShelterOut, status_code=201)
async def create_shelter(payload: ShelterCreate):
    s = await prisma.shelter.create(data=payload.model_dump())
    return ShelterOut(
        id=s.id,
        name=s.name,
        address=s.address,
        latitude=s.latitude,
        longitude=s.longitude,
        capacity=s.capacity,
        barangayId=s.barangayId,
    )

