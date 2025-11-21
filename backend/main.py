"""Backend service for evacuation center persistence.

This service provides a small MongoDB-backed CRUD API for evacuation centers.

Endpoints:
- GET    /healthz
- GET    /evac_centers           List centers
- POST   /evac_centers           Create center
- GET    /evac_centers/{id}      Read center
- PUT    /evac_centers/{id}      Update center
- DELETE /evac_centers/{id}      Delete center

The app uses `motor` for async MongoDB access. Configure the database URI with
`MONGODB_URI` environment variable. If not set, the default URI provided by the
project will be used (development only).
"""
import os
import logging
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("evac-backend")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Evacuation Centers API")

# CORS config
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
env_origins = os.getenv("HAZARD_API_ALLOW_ORIGIN")
if env_origins:
    if env_origins.strip() == "*":
        allow_all = True
        allow_origins = ["*"]
    else:
        allow_all = False
        provided = [o.strip() for o in env_origins.split(",") if o.strip()]
        allow_origins = list(dict.fromkeys(default_origins + provided))
else:
    allow_all = False
    allow_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=(not allow_all),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# MongoDB setup
MONGODB_URI = os.getenv("MONGODB_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME") or "pjdsc"
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION") or "evac_centers"
LGU_PLANS_COLLECTION = os.getenv("LGU_PLANS_COLLECTION") or "lgu_plans"

client: Optional[AsyncIOMotorClient] = None
db = None


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class EvacCenterBase(BaseModel):
    name: str = Field(..., example="Purok 3 Evacuation Center")
    capacity: Optional[int] = Field(None, example=250)
    active: Optional[bool] = Field(True, example=True)
    standby: Optional[int] = Field(0, example=10)
    center: Optional[List[float]] = Field(None, example=[14.45, 120.98])  # [lat, lng]


class EvacCenterCreate(EvacCenterBase):
    pass


class EvacCenterUpdate(BaseModel):
    name: Optional[str]
    capacity: Optional[int]
    active: Optional[bool]
    standby: Optional[int]
    center: Optional[List[float]]


class EvacCenterInDB(EvacCenterBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: lambda x: str(x)}


@app.on_event("startup")
async def startup():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGO_DB_NAME]
    logger.info("Connected to MongoDB %s (collection=%s)", MONGODB_URI.split('@')[-1], MONGO_COLLECTION)


@app.on_event("shutdown")
async def shutdown():
    global client
    if client:
        client.close()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


def _doc_to_center(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    out = {**doc}
    if "_id" in out:
        out["id"] = str(out["_id"])
        del out["_id"]
    return out


@app.get("/evac_centers")
async def list_centers():
    coll = db[MONGO_COLLECTION]
    docs = []
    async for d in coll.find():
        docs.append(_doc_to_center(d))
    return {"count": len(docs), "items": docs}


@app.post("/evac_centers", status_code=201)
async def create_center(payload: EvacCenterCreate = Body(...)):
    coll = db[MONGO_COLLECTION]
    doc = payload.dict()
    res = await coll.insert_one(doc)
    created = await coll.find_one({"_id": res.inserted_id})
    return _doc_to_center(created)


@app.get("/evac_centers/{center_id}")
async def get_center(center_id: str):
    coll = db[MONGO_COLLECTION]
    if not ObjectId.is_valid(center_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    doc = await coll.find_one({"_id": ObjectId(center_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return _doc_to_center(doc)


@app.put("/evac_centers/{center_id}")
async def update_center(center_id: str, payload: EvacCenterUpdate = Body(...)):
    coll = db[MONGO_COLLECTION]
    if not ObjectId.is_valid(center_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    update = {k: v for k, v in payload.dict().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await coll.update_one({"_id": ObjectId(center_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await coll.find_one({"_id": ObjectId(center_id)})
    return _doc_to_center(doc)


@app.delete("/evac_centers/{center_id}")
async def delete_center(center_id: str):
    coll = db[MONGO_COLLECTION]
    if not ObjectId.is_valid(center_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await coll.delete_one({"_id": ObjectId(center_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"deleted": True}


@app.get('/mobile/plans')
async def list_lgu_plans():
    coll = db[LGU_PLANS_COLLECTION]
    docs = []
    async for d in coll.find():
        out = {**d}
        if "_id" in out:
            out["id"] = str(out["_id"]) 
            del out["_id"]
        docs.append(out)
    return {"count": len(docs), "items": docs}


@app.get('/mobile/plans/{plan_id}')
async def get_lgu_plan(plan_id: str):
    coll = db[LGU_PLANS_COLLECTION]
    # allow both ObjectId and string ids
    if ObjectId.is_valid(plan_id):
        doc = await coll.find_one({"_id": ObjectId(plan_id)})
    else:
        doc = await coll.find_one({"id": plan_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    out = {**doc}
    if "_id" in out:
        out["id"] = str(out["_id"]) 
        del out["_id"]
    return out

# --- Single LGU Plan Endpoints ---

class TyphoonDetails(BaseModel):
    name: str = Field(..., example="TYPHOON KRISTINE")
    signal: int = Field(..., example=3)
    wind_kmh: int = Field(..., example=185)
    movement: str = Field(..., example="NW @ 20kph")

class LGUSinglePlanPayload(BaseModel):
    text: str = Field(..., example="Evacuation routings and resource allocations...")
    typhoon: TyphoonDetails

@app.get('/plan')
async def get_current_plan():
    """Return the currently published plan document (single resource)."""
    coll = db[LGU_PLANS_COLLECTION]
    doc = await coll.find_one({"key": "current"})
    if not doc:
        return {"exists": False}
    out = {**doc}
    if "_id" in out:
        out["id"] = str(out["_id"])
        del out["_id"]
    return {"exists": True, "plan": out}

@app.put('/plan')
async def put_current_plan(payload: LGUSinglePlanPayload):
    """Replace the single plan document with provided content."""
    coll = db[LGU_PLANS_COLLECTION]
    doc = {
        "key": "current",
        "text": payload.text,
        "typhoon": payload.typhoon.dict(),
        "updated_at": __import__('datetime').datetime.utcnow().isoformat() + 'Z'
    }
    await coll.update_one({"key": "current"}, {"$set": doc}, upsert=True)
    stored = await coll.find_one({"key": "current"})
    out = {**stored}
    if "_id" in out:
        out["id"] = str(out["_id"])
        del out["_id"]
    return {"updated": True, "plan": out}

# --- Capacity-only update endpoint ---
class CapacityUpdate(BaseModel):
    capacity: int = Field(..., ge=0, example=300)

@app.put('/evac_centers/{center_id}/capacity')
async def update_capacity(center_id: str, payload: CapacityUpdate):
    """Update only the capacity of a center. Capacity must be >= 0."""
    coll = db[MONGO_COLLECTION]
    if not ObjectId.is_valid(center_id):
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await coll.update_one({"_id": ObjectId(center_id)}, {"$set": {"capacity": payload.capacity}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    doc = await coll.find_one({"_id": ObjectId(center_id)})
    return _doc_to_center(doc)
