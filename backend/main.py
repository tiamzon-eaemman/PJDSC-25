"""Minimal file-backed serverless-style backend.

This service loads processed GeoJSON files from `../dataset/processed_data/` at startup,
builds a Shapely STRtree spatial index, and exposes a single endpoint:

  GET /features/{layer}?min_lat=&min_lng=&max_lat=&max_lng=&limit=&format=geobuf

If `format=geobuf` or the request Accept header includes `application/x-protobuf`, the
endpoint returns a Geobuf (protobuf) binary (Content-Type: application/x-protobuf).
Otherwise it returns a standard GeoJSON FeatureCollection (application/json).

This file intentionally avoids any database or Supabase code and is designed to be
lightweight and serverless-friendly.
"""
import os
import json
import logging
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from shapely.geometry import shape, box
from shapely.strtree import STRtree
import gzip

try:
    import pygeobuf
    PYGEOBUF_AVAILABLE = True
except Exception:
    pygeobuf = None
    PYGEOBUF_AVAILABLE = False

load_dotenv()
logger = logging.getLogger("hazard-backend")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Hazard GeoBuf Server")

# CORS configuration
# - By default allow local Next.js dev origins
# - You can set `HAZARD_API_ALLOW_ORIGIN="*"` to allow all origins (dev only).
# - Or set `HAZARD_API_ALLOW_ORIGIN` to a comma-separated list of allowed origins.
default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
env_origins = os.getenv("HAZARD_API_ALLOW_ORIGIN")
if env_origins:
    # allow wildcard '*' or comma-separated origins
    if env_origins.strip() == "*":
        allow_all = True
        allow_origins = ["*"]
    else:
        allow_all = False
        # merge default with provided ones (avoid duplicates)
        provided = [o.strip() for o in env_origins.split(",") if o.strip()]
        allow_origins = list(dict.fromkeys(default_origins + provided))
else:
    allow_all = False
    allow_origins = default_origins

# If allow_all ("*"), we must not allow credentials per CORS rules.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=(not allow_all),
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# Map logical layer name -> processed geojson path
BASE_DIR = os.path.dirname(__file__)
LAYER_FILES = {
    "flood": os.path.join(BASE_DIR, "..", "dataset", "processed_data", "Laguna_Flood_5year.geojson"),
    "landslide": os.path.join(BASE_DIR, "..", "dataset", "processed_data", "Laguna_LandslideHazards.geojson"),
}

# In-memory cache: features list and STRtree per layer
LAYER_CACHE: Dict[str, Dict[str, Any]] = {}


def load_layer(layer_name: str) -> None:
    """Load GeoJSON file and build STRtree of geometries for the named layer."""
    path = LAYER_FILES.get(layer_name)
    if not path or not os.path.exists(path):
        logger.warning("Processed file not found for %s: %s", layer_name, path)
        return

    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)

    features = data.get("features", []) if isinstance(data, dict) else []
    geoms = []
    id_map = {}
    for i, feat in enumerate(features):
        geom_json = feat.get("geometry")
        if not geom_json:
            continue
        try:
            g = shape(geom_json)
        except Exception:
            continue
        geoms.append(g)
        id_map[id(g)] = i

    tree = STRtree(geoms) if geoms else None
    LAYER_CACHE[layer_name] = {"features": features, "geoms": geoms, "tree": tree, "id_map": id_map}
    logger.info("Loaded layer %s (%d geometries)", layer_name, len(geoms))


@app.on_event("startup")
def startup_event():
    # Preload layers
    for layer in list(LAYER_FILES.keys()):
        load_layer(layer)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/features/{layer_name}")
def features(layer_name: str, min_lat: float, min_lng: float, max_lat: float, max_lng: float, limit: int = 1000, request: Request = None):
    """Return features intersecting the bbox. Supports Geobuf if requested via `format=geobuf` or Accept header."""
    if layer_name not in LAYER_FILES:
        raise HTTPException(status_code=404, detail="Unknown layer")

    cache = LAYER_CACHE.get(layer_name)
    if not cache or not cache.get("tree"):
        raise HTTPException(status_code=500, detail=f"Layer {layer_name} not loaded")

    query_box = box(min_lng, min_lat, max_lng, max_lat)
    candidates = cache["tree"].query(query_box)

    features = []
    for g in candidates:
        try:
            if not g.intersects(query_box):
                continue
        except Exception:
            continue
        idx = cache["id_map"].get(id(g))
        if idx is None:
            try:
                idx = cache["geoms"].index(g)
            except ValueError:
                continue
        feat = cache["features"][idx]
        features.append(feat)
        if len(features) >= limit:
            break

    fc = {"type": "FeatureCollection", "features": features}

    # Decide output format: if client asked for geobuf but server can't provide it,
    # fall back to compressed JSON. Support `format=geobuf` or `format=compressed`.
    fmt = None
    if request:
        fmt = request.query_params.get("format")
        if not fmt:
            accept = request.headers.get("accept", "")
            if "application/x-protobuf" in accept or "application/vnd.mapbox-vector-tile" in accept:
                fmt = "geobuf"

    # If geobuf requested and available, return it
    if fmt == "geobuf":
        if 'pygeobuf' in globals() and PYGEOBUF_AVAILABLE:
            try:
                pb = pygeobuf.encode(fc)
                return Response(content=pb, media_type="application/x-protobuf")
            except Exception as e:
                logger.exception("Failed to encode geobuf, falling back to compressed JSON")
                fmt = "compressed"
        else:
            # indicate not available by falling back to compressed
            fmt = "compressed"

    # If compressed requested, return gzipped JSON (browser will decode automatically)
    if fmt == "compressed":
        try:
            raw = json.dumps(fc).encode("utf-8")
            gz = gzip.compress(raw)
            headers = {"Content-Encoding": "gzip"}
            return Response(content=gz, media_type="application/json", headers=headers)
        except Exception:
            logger.exception("Failed to produce compressed response; returning plain JSON")

    # Default: return normal JSON
    return JSONResponse(fc)