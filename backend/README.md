# SAGIP Backend (FastAPI + Prisma + PostgreSQL)

A GIS-focused API for processing and serving hazard data for the SAGIP platform.

## Prerequisites
- Python 3.11+
- Node.js 18+ (for Prisma engines/CLI)
- PostgreSQL 13+

## Setup

1) Create and activate a virtual environment
```bash
python -m venv .venv
source .venv/bin/activate
```

2) Install Python dependencies
```bash
pip install -r requirements.txt
```

3) Configure environment
```bash
cp .env.example .env
# Edit .env to set DATABASE_URL
```

4) Install Prisma CLI (Node) if not already installed
```bash
npm -g install prisma
```

5) Generate Prisma Client (Python)
```bash
prisma generate
```

6) Run migrations (creates the database schema)
```bash
prisma migrate dev --name init
```

7) Start the API server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure
```
backend/
  app/
    core/
      config.py
      prisma_client.py
    routers/
      health.py
      hazards.py
      barangays.py
      evacuation.py
    main.py
  prisma/
    schema.prisma
  requirements.txt
  .env.example
```

## GIS API Endpoints

### Hazard Data
- `GET /api/hazards/` - List hazard data with filtering
- `POST /api/hazards/` - Create hazard data entry
- `GET /api/hazards/geojson` - Get hazard data as GeoJSON FeatureCollection
- `GET /api/hazards/stats` - Get hazard statistics

### Barangays
- `GET /api/barangays/` - List barangays
- `POST /api/barangays/` - Create barangay
- `GET /api/barangays/geojson` - Get barangays as GeoJSON

### Evacuation Centers
- `GET /api/evacuation/` - List evacuation centers
- `POST /api/evacuation/` - Create evacuation center
- `GET /api/evacuation/geojson` - Get evacuation centers as GeoJSON

## Data Models

### HazardData
- `type`: FLOOD, LANDSLIDE, STORM_SURGE, WIND, EARTHQUAKE
- `severity`: 1-5 scale
- `geometry`: GeoJSON geometry (Polygon, MultiPolygon, Point)
- `source`: Data source (e.g., "PAGASA", "LIPAD", "UP_NOAH")
- `confidence`: 0.0-1.0 confidence score
- `elevation`: meters above sea level
- `affectedPopulation`: estimated affected people

### Barangay
- Basic location info with optional lat/lng coordinates

### EvacuationCenter
- Location and capacity information

## Usage for Frontend GIS

The frontend can fetch GeoJSON data for display on maps:

```javascript
// Get all flood hazards
const floodHazards = await fetch('/api/hazards/geojson?hazard_type=FLOOD');

// Get evacuation centers
const centers = await fetch('/api/evacuation/geojson');

// Get barangays
const barangays = await fetch('/api/barangays/geojson');
```

## Notes
- The Python Prisma client is generated from `prisma/schema.prisma`. Always re-run `prisma generate` after modifying the schema.
- Ensure `DATABASE_URL` in `.env` points to a reachable PostgreSQL instance.
- GeoJSON endpoints are optimized for GIS display with proper coordinate ordering (longitude, latitude).
