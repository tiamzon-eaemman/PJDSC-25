SAGIP Backend (FastAPI + Prisma + PostgreSQL)

Prerequisites
- Python 3.11+
- Node.js 18+ (for Prisma engines/CLI)
- PostgreSQL 13+

Setup
1) Create and activate a virtual environment
```
python -m venv .venv
source .venv/bin/activate
```

2) Install Python dependencies
```
pip install -r requirements.txt
```

3) Configure environment
```
cp .env.example .env
# Edit .env to set DATABASE_URL
```

4) Install Prisma CLI (Node) if not already installed
```
npm -g install prisma
```

5) Generate Prisma Client (Python)
```
prisma generate
```

6) Run migrations (creates the database schema)
```
prisma migrate dev --name init
```

7) Start the API server
```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Project Structure
```
backend/
  app/
    core/
      config.py
      prisma_client.py
    routers/
      health.py
      users.py
      barangays.py
      shelters.py
      analytics.py
    main.py
  prisma/
    schema.prisma
  requirements.txt
  .env.example
```

Notes
- The Python Prisma client is generated from `prisma/schema.prisma`. Always re-run `prisma generate` after modifying the schema.
- Ensure `DATABASE_URL` in `.env` points to a reachable PostgreSQL instance.

Analytics Endpoints
- POST `/api/analytics/route`:
  - Body: graph nodes/edges, `start`, `goal`, and hazard GeoJSON
  - Returns: path with cost penalizing edges intersecting hazards
- POST `/api/analytics/prioritize`:
  - Body: list of households with vulnerable counts and hazard/distance
  - Returns: households ranked by priority score (higher = more urgent)
- POST `/api/analytics/unreachable`:
  - Body: graph nodes/edges and hazard GeoJSON
  - Returns: node ids that become unreachable when hazardous edges are removed

Schema Additions
- `HazardArea` model stores hazard polygons and severity per barangay with `HazardType` enum.

Assumptions
- Routing uses a simple weighted shortest path; edges intersecting hazards get a large penalty (configurable client-side in request). For fully blocked roads, use `/unreachable`.
- Prioritization weights are initial heuristics aligned to the context (elderly, PWDs, pregnant, children, hazard severity, distance). Tune per LGU needs.

