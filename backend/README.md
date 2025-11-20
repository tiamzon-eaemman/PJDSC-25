Hazard backend (serverless-style, Geobuf)
=========================================

This backend is a minimal file-backed server designed for development and serverless deployments.

What it does
------------
- Loads processed GeoJSON files in `dataset/processed_data/` into memory on startup and builds a spatial index (STRtree).
- Exposes a lightweight bbox query endpoint that returns only features intersecting the requested bounding box.
-- Supports Geobuf encoding to reduce payload size (client can request `?format=geobuf` or set Accept header `application/x-protobuf`).
  If Geobuf isn't available on the server (some platforms may not have `pygeobuf`), the server will fall back to returning gzip-compressed GeoJSON when the client requests `?format=compressed` or `?format=geobuf`.

Endpoints
---------
- `GET /healthz` — basic health check
-- `GET /features/{layer}?min_lat=&min_lng=&max_lat=&max_lng=&limit=&format=geobuf` — returns a FeatureCollection. Use `format=geobuf` or Accept header to get Geobuf. If Geobuf is not available, request `format=compressed` to receive gzipped GeoJSON (automatically decompressed by browsers).

Run locally
-----------
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Example requests
----------------
- GeoJSON (default):

  curl "http://localhost:8000/features/flood?min_lat=14.0&min_lng=120.8&max_lat=14.8&max_lng=121.2&limit=200"

-- Geobuf by query param (if server supports it):

  curl -H "Accept: application/x-protobuf" "http://localhost:8000/features/flood?min_lat=14.0&min_lng=120.8&max_lat=14.8&max_lng=121.2&limit=200&format=geobuf" --output flood.pbf

-- Compressed GeoJSON (fallback / alternative):

  curl "http://localhost:8000/features/flood?min_lat=14.0&min_lng=120.8&max_lat=14.8&max_lng=121.2&limit=200&format=compressed" --output flood.json.gz


Notes
-----
- The server keeps full GeoJSON files in memory. This is fine for moderate datasets but for very large datasets consider pre-building vector tiles (MBTiles) or splitting files.
- Geobuf reduces bandwidth but requires client-side decoding using `pbf` + `geobuf` (the frontend has been updated to attempt geobuf and fall back to GeoJSON).
- CORS is enabled for `http://localhost:3000` and `http://127.0.0.1:3000`. Add additional origins via `HAZARD_API_ALLOW_ORIGIN` env var.

