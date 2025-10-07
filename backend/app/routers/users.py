from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.core.prisma_client import prisma


class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    barangayId: Optional[int] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    barangayId: Optional[int] = None


router = APIRouter()


@router.get("/", response_model=List[UserOut])
async def list_users():
    users = await prisma.user.find_many()
    return [UserOut(id=u.id, email=u.email, name=u.name, barangayId=u.barangayId) for u in users]


@router.post("/", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate):
    existing = await prisma.user.find_unique(where={"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")
    u = await prisma.user.create(data=payload.model_dump())
    return UserOut(id=u.id, email=u.email, name=u.name, barangayId=u.barangayId)

