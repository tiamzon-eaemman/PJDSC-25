from typing import List, Tuple, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.routing import compute_route
from app.services.prioritization import prioritize_households
from app.services.reachability import unreachable_nodes


class GraphNode(BaseModel):
    id: str
    lat: float
    lon: float


class GraphEdge(BaseModel):
    a: str
    b: str
    dist: float = Field(gt=0)


class RouteRequest(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    start: str
    goal: str
    hazardGeoJSON: List[Dict[str, Any]] = []


class Household(BaseModel):
    id: str
    numElderly: int = 0
    numChildren: int = 0
    numPWD: int = 0
    numPregnant: int = 0
    distanceToShelterKm: float = 0
    hazardSeverity: float = 1.0


class ReachabilityRequest(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    hazardGeoJSON: List[Dict[str, Any]] = []


router = APIRouter(tags=["analytics"])


@router.post("/route")
async def route(req: RouteRequest):
    nodes: List[Tuple[str, float, float]] = [(n.id, n.lat, n.lon) for n in req.nodes]
    edges: List[Tuple[str, str, float]] = [(e.a, e.b, e.dist) for e in req.edges]
    try:
        result = compute_route(nodes, edges, req.start, req.goal, req.hazardGeoJSON)
        return result
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/prioritize")
async def prioritize(households: List[Household]):
    ranked = prioritize_households([h.model_dump() for h in households])
    return ranked


@router.post("/unreachable")
async def unreachable(req: ReachabilityRequest):
    nodes: List[Tuple[str, float, float]] = [(n.id, n.lat, n.lon) for n in req.nodes]
    edges: List[Tuple[str, str, float]] = [(e.a, e.b, e.dist) for e in req.edges]
    ids = unreachable_nodes(nodes, edges, req.hazardGeoJSON)
    return {"unreachable": ids}

