from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

from app.core.prisma_client import prisma


class HazardType(str, Enum):
    FLOOD = "FLOOD"
    LANDSLIDE = "LANDSLIDE"
    STORM_SURGE = "STORM_SURGE"
    WIND = "WIND"
    EARTHQUAKE = "EARTHQUAKE"


class HazardDataCreate(BaseModel):
    type: HazardType
    severity: int = 1
    geometry: Dict[str, Any]  # GeoJSON
    source: Optional[str] = None
    confidence: Optional[float] = None
    elevation: Optional[float] = None
    affectedPopulation: Optional[int] = None
    barangayId: Optional[int] = None


class HazardDataOut(BaseModel):
    id: int
    type: HazardType
    severity: int
    geometry: Dict[str, Any]
    source: Optional[str] = None
    confidence: Optional[float] = None
    elevation: Optional[float] = None
    affectedPopulation: Optional[int] = None
    barangayId: Optional[int] = None


router = APIRouter()


@router.get("/", response_model=List[HazardDataOut])
async def get_hazards(
    hazard_type: Optional[HazardType] = Query(None),
    barangay_id: Optional[int] = Query(None),
    min_severity: Optional[int] = Query(None),
    bbox: Optional[str] = Query(None)  # "min_lon,min_lat,max_lon,max_lat"
):
    """Get hazard data with optional filtering"""
    where_clause = {}
    
    if hazard_type:
        where_clause["type"] = hazard_type.value
    if barangay_id:
        where_clause["barangayId"] = barangay_id
    if min_severity:
        where_clause["severity"] = {"gte": min_severity}
    
    hazards = await prisma.hazarddata.find_many(where=where_clause)
    
    # TODO: Implement bbox filtering for geometry
    # This would require PostGIS or custom geometry filtering
    
    return [
        HazardDataOut(
            id=h.id,
            type=HazardType(h.type),
            severity=h.severity,
            geometry=h.geometry,
            source=h.source,
            confidence=h.confidence,
            elevation=h.elevation,
            affectedPopulation=h.affectedPopulation,
            barangayId=h.barangayId
        )
        for h in hazards
    ]


@router.post("/", response_model=HazardDataOut, status_code=201)
async def create_hazard(hazard: HazardDataCreate):
    """Create new hazard data entry"""
    h = await prisma.hazarddata.create(data=hazard.model_dump())
    return HazardDataOut(
        id=h.id,
        type=HazardType(h.type),
        severity=h.severity,
        geometry=h.geometry,
        source=h.source,
        confidence=h.confidence,
        elevation=h.elevation,
        affectedPopulation=h.affectedPopulation,
        barangayId=h.barangayId
    )


@router.get("/geojson")
async def get_hazards_geojson(
    hazard_type: Optional[HazardType] = Query(None),
    barangay_id: Optional[int] = Query(None),
    min_severity: Optional[int] = Query(None)
):
    """Get hazard data as GeoJSON FeatureCollection for GIS display"""
    where_clause = {}
    
    if hazard_type:
        where_clause["type"] = hazard_type.value
    if barangay_id:
        where_clause["barangayId"] = barangay_id
    if min_severity:
        where_clause["severity"] = {"gte": min_severity}
    
    hazards = await prisma.hazarddata.find_many(where=where_clause)
    
    features = []
    for h in hazards:
        feature = {
            "type": "Feature",
            "properties": {
                "id": h.id,
                "type": h.type,
                "severity": h.severity,
                "source": h.source,
                "confidence": h.confidence,
                "elevation": h.elevation,
                "affectedPopulation": h.affectedPopulation,
                "barangayId": h.barangayId
            },
            "geometry": h.geometry
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/stats")
async def get_hazard_stats():
    """Get hazard statistics for dashboard"""
    total_hazards = await prisma.hazarddata.count()
    
    # Count by type
    type_stats = {}
    for hazard_type in HazardType:
        count = await prisma.hazarddata.count(where={"type": hazard_type.value})
        type_stats[hazard_type.value] = count
    
    # Count by severity
    severity_stats = {}
    for severity in range(1, 6):
        count = await prisma.hazarddata.count(where={"severity": severity})
        severity_stats[f"severity_{severity}"] = count
    
    return {
        "total": total_hazards,
        "by_type": type_stats,
        "by_severity": severity_stats
    }
