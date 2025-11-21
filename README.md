# SAGIP: Synchronizing Action through Geohazard Information Platform

[![GitHub license](https://img.shields.io/github/license/alexgaaranes/PJDSC-25?style=for-the-badge)](LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/alexgaaranes/PJDSC-25?style=for-the-badge)](https://github.com/alexgaaranes/PJDSC-25/graphs/contributors)

> Entry Project for **PJDSC 2025** (Philippine Junior Data Science Challenge) – advancing localized, data-driven climate and disaster resilience through an integrated coordination platform.

SAGIP (Synchronizing Action through Geohazard Information Platform) unifies hazard intelligence, evacuation logistics, citizen communication, and operational planning into a cohesive, real-time system. By harnessing authoritative geospatial datasets (e.g., **UP NOAH** flood & landslide layers) and contextual LGU inputs, SAGIP enables faster, smarter decisions when minutes matter.

## Table of Contents
1. Vision & Motivation  
2. Core Features  
3. PJDSC 2025 Context  
4. Data Sources & NOAH Integration  
5. System Architecture  
6. Installation & Setup  
7. Development Workflow  
8. Backend API Overview  
9. Evacuation Center & Plan Publishing Flow  
10. Mobile PWA & Offline Strategy  
11. Geospatial Processing Pipeline  
12. Environment Variables  
13. Roadmap  
14. Contributing  
15. License & Attribution  
16. Acknowledgments

## 1. Vision & Motivation
Disaster response at the barangay level is often fragmented: paper maps, siloed spreadsheets, uncertain center capacity, and delayed public messaging. SAGIP bridges these gaps by synchronizing:  
- Hazard layers (flood / landslide)  
- Real-time evacuation center capacity  
- Published LGU response plan (single source of truth)  
- Citizen-facing mobile PWA with nearest safe centers  
- Map-based spatial search (Nominatim bounded queries)  
The result: a rapid clarity loop for responders, planners, and citizens.

## 2. Core Features
- **Intelligent Hazard Dashboard:** Interactive Leaflet map with filtered overlays (flood / landslide).  
- **Evacuation Center Management:** Add, edit (capacity), and remove centers; capacity refresh with a dedicated endpoint.  
- **Single LGU Plan Publishing:** One canonical plan accessible via `/plan`, including typhoon metadata.  
- **Mobile Progressive Web App (PWA):** Offline-capable citizen interface (nearest centers ranking, current plan, hazard context).  
- **Geolocation Ranking:** Real-time distance computation (Haversine) to available centers.  
- **Bounded Spatial Search:** Area search constrained to the barangay’s bounding box (Nominatim with `viewbox`).  
- **Offline Caching:** `next-pwa` runtime caching for plan, centers, and selected OSM tiles + localStorage fallback.  
- **Deletion Confirmation & Safe Editing:** UI modals ensure intentional data changes.  
- **Sticky Operational Metrics:** Always-visible aggregate capacity and active center count in the dashboard.

## 3. PJDSC 2025 Context
This project is an official entry to **PJDSC 2025**, focusing on actionable data science applied to disaster resilience. SAGIP demonstrates:  
- Data engineering (geospatial conversion & normalization).  
- Applied algorithms (distance prioritization, hazard filtering).  
- UX for dual stakeholders: responders (desktop dashboard) & citizens (mobile PWA).  
- Responsible data use (attribution, non-destructive caching, mindful tile usage).  

## 4. Data Sources & NOAH Integration
Primary hazard data originates from authoritative repositories such as **UP NOAH**. Shapefiles (e.g., flood return period, landslide susceptibility) are transformed into GeoJSON for efficient frontend rendering.  
- Raw sources placed under `dataset/flood_data/` and `dataset/landslide_data/`.  
- Processed GeoJSON artifacts stored in `dataset/processed_data/` and duplicated under `frontend/public/processed_data/` for direct client consumption.  
- Conversion script: `dataset/scripts/converter.py` (GDAL / GeoPandas pipeline) ensures CRS normalization and attribute pruning.  
> Attribution: Data courtesy of **UP NOAH** and relevant national geohazard information systems. This project does not redistribute proprietary raw data; processed layers are strictly for demonstration and research under PJDSC guidelines.

## 5. System Architecture
| Layer | Tech | Responsibilities |
|-------|------|------------------|
| Frontend | Next.js (TypeScript), React, Leaflet, next-pwa | Map UI, plan modals, evacuation center CRUD interfaces, PWA offline behavior |
| Backend | FastAPI, Motor (MongoDB), Shapely/GeoPandas (preprocessing) | REST API for centers & plan, capacity-only update endpoint, data persistence |
| Data | Shapefiles → GeoJSON | Hazard overlays, spatial bounding box for searches |
| Mobile | PWA (service worker + runtime caching) | Citizen access, nearest center ranking, offline fallback |

### Key Patterns
- **Single Plan Resource:** `/plan` (GET/PUT) eliminates version sprawl.  
- **Capacity Update Endpoint:** `/evac_centers/{id}/capacity` (PUT) with non-negative validation.  
- **Context-based State:** `EvacContext` centralizes center operations + refresh logic.  
- **Runtime Caching:** NetworkFirst for dynamic data; CacheFirst for OSM tiles (respect usage policies).  

## 6. Installation & Setup
```bash
# Clone
git clone https://github.com/alexgaaranes/PJDSC-25.git
cd PJDSC-25

# Backend (FastAPI)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Run FastAPI dev server
uvicorn main:app --reload --port 8000

# Frontend (Next.js)
cd ../frontend
npm install
npm run dev
```
Open: `http://localhost:3000`

## 7. Development Workflow
| Action | Command |
|--------|---------|
| Start backend | `uvicorn main:app --reload` |
| Start frontend | `npm run dev` |
| Type checking | `npm run typecheck` (if configured) |
| Build PWA | `npm run build` |

## 8. Backend API Overview (Selected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/evac_centers` | GET | List centers |
| `/evac_centers` | POST | Create center |
| `/evac_centers/{id}` | PUT | Update full center record |
| `/evac_centers/{id}` | DELETE | Remove center |
| `/evac_centers/{id}/capacity` | PUT | Update only capacity (>= 0) |
| `/plan` | GET | Retrieve current published plan |
| `/plan` | PUT | Publish or replace plan + typhoon metadata |

MongoDB (via Motor) stores structured center documents; plan resource stored as single document with timestamp.

## 9. Evacuation Center & Plan Publishing Flow
1. Operator adds centers via dashboard (map placement).  
2. Capacity & attributes editable through the `EvacEditModal`.  
3. LGU composes the response plan in the “Send Plan” modal with contextual typhoon details.  
4. Citizens access the plan instantly in the Mobile PWA (with offline fallback).  
5. Refresh action triggers re-fetch + local cache update (`localStorage` + runtime caching).  
6. Capacity “Refresh” updates aggregated stats (sticky footer metrics).  

## 10. Mobile PWA & Offline Strategy
- Service worker generated via `next-pwa`.  
- `runtimeCaching` configured for:  
  - `/plan` (NetworkFirst → fallback cache)  
  - `/evac_centers` (NetworkFirst)  
  - OSM tiles (CacheFirst, constrained)  
- LocalStorage fallback when network fails (`cached_plan`, `cached_centers`).  
- Mobile UI provides badges: `Offline`, `Cached`.  
- Sticky action bar enables quick refresh & nearest recomputation.  

## 11. Geospatial Processing Pipeline
1. Acquire shapefiles (UP NOAH flood return period / landslide hazard).  
2. Convert using `dataset/scripts/converter.py` (GeoPandas).  
3. Normalize CRS (e.g., EPSG:4326).  
4. Simplify attributes (retain only necessary geometry + classifications).  
5. Export to GeoJSON for lightweight client rendering.  
6. Store artifacts in `frontend/public/processed_data/` for static serving.  
7. Use bounding box derived from dataset for Nominatim-controlled search scope.

## 12. Environment Variables
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_HAZARD_API_URL` | Base URL of FastAPI backend |
| (Backend DB vars) | Mongo connection string, etc. |

Example frontend `.env.local`:
```env
NEXT_PUBLIC_HAZARD_API_URL=http://localhost:8000
```

## 13. Roadmap
- Integrate dynamic typhoon feeds (e.g., PAGASA API).  
- Add role-based authentication (LGU staff vs public).  
- Enhance AI reasoning layer for resource allocation simulation.  
- Implement websocket push for near real-time capacity updates.  
- Add multilingual support (i18n) for broader accessibility.  
- Expand hazard catalog (storm surge, seismic risk).  
- Data quality dashboards (staleness, completeness).  

## 14. Contributing
1. Fork the repository.  
2. Create a feature branch: `git checkout -b feat/your-feature`.  
3. Commit changes with clear messages.  
4. Open a Pull Request describing motivation & changes.  
5. Ensure no sensitive raw data committed (keep processed public layers).  

## 15. License & Attribution
This project is released under the terms of the [LICENSE](LICENSE).  
Hazard data derived from **UP NOAH** and related Philippine geohazard sources; all rights remain with original data providers. Use is for educational & research demonstration under PJDSC 2025 context.  
OpenStreetMap tiles © OpenStreetMap contributors (usage governed by OSM tile usage policy).  

## 16. Acknowledgments
- UP NOAH Project – for providing accessible hazard datasets.  
- OpenStreetMap Contributors – global collaborative geospatial base layer.  
- PJDSC 2025 Organizing Committee – fostering applied data science innovation.  
- Community volunteers & LGU stakeholders who informed usability priorities.  

---
For questions, feature ideas, or data collaboration proposals: please open an issue or start a discussion.

> Building smarter, more resilient communities—from ground truth to coordinated action.