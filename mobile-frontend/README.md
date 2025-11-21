# SAGIP Frontend - Disaster Advisory System

A Progressive Web App (PWA) for real-time disaster advisory and emergency response system.

## Features

- **Real-time Advisory Display**: Shows current disaster advisories with affected areas
- **Progressive Web App**: Installable on mobile devices with offline capabilities
- **Responsive Design**: Optimized for mobile devices with dark theme
- **Navigation**: Bottom navigation with Info, Home, and Alerts tabs
- **API Integration**: Connected to FastAPI backend for real data

## Design

The app matches the provided design with:
- Dark theme (#1C1C1E background)
- Status bar with time and system indicators
- Update status bar with last updated timestamp
- Advisory cards with appropriate icons and colors
- Bottom navigation bar with three tabs

## Components

- `AdvisoryCard`: Displays individual advisory information
- `AdvisorySection`: Groups advisories by date
- `StatusBar`: Shows last update information
- `NavigationBar`: Bottom navigation with tabs

## Pages

- `/` - Main advisory page (Home)
- `/info` - System information (Barangays and Shelters)
- `/alerts` - Emergency alerts page

## API Integration

The frontend now consumes live data from the FastAPI backend (no `/api` prefix):
- Health check: `GET /healthz`
- Evacuation centers: `GET /evac_centers` (list), `PUT /evac_centers/{id}/capacity`
- Current published plan (narrative text, typhoon advisory, hotlines, checklist, optional map link):
	- `GET /plan` returns `{ exists, plan }`
	- `PUT /plan` updates the single current plan

Environment variable:
Set `NEXT_PUBLIC_BACKEND_URL` in `.env.local` (example: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`).
If unset, the client defaults to `http://192.168.68.127:8000`.

Removed deprecated placeholder endpoints (`/users`, `/barangays`, `/shelters`). Components now use dynamic hooks (`useEvacCenters`, `useCurrentPlan`).

## Offline & Caching

Offline support is provided via:
- `next-pwa` service worker (runtime caching for `/evac_centers` and `/plan` plus static assets)
- LocalStorage hydration for plan and evacuation centers (instant render + offline fallback)
- Checklist completion state persisted locally (`sagip_plan_checklist_state`)

Caching Strategies:
- API (plan & centers): NetworkFirst with short expiration (plan 2m, centers 5m)
- Static assets (JS/CSS/fonts/SVG): CacheFirst (7 days)

To test offline:
1. Load the app while online so initial data caches.
2. Switch browser to offline mode; previously fetched plan & center data and checklist state remain visible.

## Dynamic UI Changes

- Hazard summary now labeled "Plan" with last updated timestamp.
- Checklist modal consumes live plan checklist items.
- Hotlines page (`/info`) displays plan hotlines and opens `map_link` if provided.
- Map shows evacuation center markers and highlights nearest center to user's geolocation.

## PWA Features

- Service Worker for offline functionality
- Web App Manifest for installation
- Apple Touch Icon support
- Standalone display mode

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Backend Integration

Run the FastAPI backend (port 8000). Ensure MongoDB is configured via backend `.env`.

Update or create `mobile-frontend/.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Then start dev server:
```bash
npm run dev
```
Navigate to the Home page to see live plan + evacuation center data. Use `/map` for nearest evacuation site.