from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.core.prisma_client import prisma


class BarangayCreate(BaseModel):
    name: str
    municipality: str
    province: str


class BarangayOut(BaseModel):
    id: int
    name: str
    municipality: str
    province: str


router = APIRouter()


@router.get("/", response_model=List[BarangayOut])
async def list_barangays():
    brgys = await prisma.barangay.find_many()
    return [BarangayOut(id=b.id, name=b.name, municipality=b.municipality, province=b.province) for b in brgys]


@router.post("/", response_model=BarangayOut, status_code=201)
async def create_barangay(payload: BarangayCreate):
    b = await prisma.barangay.create(data=payload.model_dump())
    return BarangayOut(id=b.id, name=b.name, municipality=b.municipality, province=b.province)

