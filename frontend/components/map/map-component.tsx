"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// Fix missing default marker icons when bundling
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
});

// Geobuf decoding libraries
// @ts-ignore
import Pbf from 'pbf'
// @ts-ignore
import geobuf from 'geobuf'


// --- Typhoon Data Simulation ---
// Initial center for the map (Manila area, Philippines)
const initialCenter: [number, number] = [14.5995, 120.9842];
const initialZoom = 10;

// Simulated GeoJSON-like data for a Typhoon Track Polyline
const simulatedTyphoonTrack: [number, number][] = [
    [15.5, 122.0],
    [14.8, 121.5],
    [14.4, 120.9],
    [14.2, 120.3],
];

// Simulated Marker for a High-Priority Evacuation Zone
const highRiskZone = {
    position: [14.45, 120.98] as [number, number],
    label: "Purok 3: High Flood Risk",
    popup: "Mandatory Evacuation Order Issued",
};

// SEA Tile
const CANVAS_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const CANVAS_ATTRIBUTION = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

// Helpers for geodesic destination point calculation
const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

/**
 * Calculate destination point given lat, lng, distance in meters and bearing degrees
 * Uses the spherical Earth projected to a sphere formula (good accuracy for our use)
 */
function destinationPoint(lat: number, lng: number, distanceMeters: number, bearingDeg: number) {
    const R = 6378137 // earth radius in meters (WGS-84)
    const δ = distanceMeters / R
    const θ = toRad(bearingDeg)
    const φ1 = toRad(lat)
    const λ1 = toRad(lng)

    const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    const φ2 = Math.asin(sinφ2)
    const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1)
    const x = Math.cos(δ) - Math.sin(φ1) * sinφ2
    const λ2 = λ1 + Math.atan2(y, x)

    return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 } // normalize lon
}

/**
 * Component that loads the GeoJSON outline and applies the mask.
 * It must run in the browser so it uses the `useMap` hook.
 */
const GeoJsonOutline: React.FC = () => {
    const map = useMap()

    useEffect(() => {
        let outlineLayer: L.Layer | null = null
        let maskLayer: L.Layer | null = null

        const coordsToLatLngs = (coords: number[][]) => coords.map((c) => [c[1], c[0]] as [number, number])

        const addMaskWithHoles = (rings: number[][][]) => {
            // World rectangle (outer ring) lat,lng pairs
            const outer = [
                [90, -180],
                [90, 180],
                [-90, 180],
                [-90, -180],
            ] as [number, number][]

            // Convert polygon rings (each ring is [lng,lat]) to [lat,lng]
            const holes = rings.map((ring) => coordsToLatLngs(ring))

            // Leaflet accepts [outer, hole1, hole2, ...]
            const latlngs: L.LatLngExpression[] = [outer as any]
            holes.forEach((h) => latlngs.push(h as any))

            // reduced opacity to lessen the dim outside
            maskLayer = L.polygon(latlngs as any, {
                color: '#000',
                weight: 0,
                fillColor: '#000',
                fillOpacity: 0.25,
                interactive: false,
            }).addTo(map)
        }

        const load = async () => {
            try {
                const res = await fetch('/map.geojson')
                if (!res.ok) throw new Error(`Failed to fetch map.geojson: ${res.status}`)
                const data = await res.json()

                // Find the first polygon/multipolygon feature(s)
                const polygonFeatures: GeoJSON.Feature[] = []
                if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                    data.features.forEach((f: any) => {
                        if (!f || !f.geometry) return
                        const t = f.geometry.type
                        if (t === 'Polygon' || t === 'MultiPolygon') polygonFeatures.push(f)
                    })
                } else if (data.type === 'Feature' && data.geometry) {
                    const t = data.geometry.type
                    if (t === 'Polygon' || t === 'MultiPolygon') polygonFeatures.push(data)
                }

                if (polygonFeatures.length === 0) {
                    console.warn('No Polygon/MultiPolygon found in map.geojson')
                    return
                }

                // Create outline layer as dotted low-opacity red line
                outlineLayer = L.geoJSON(data, {
                    style: () => ({
                        color: 'red',
                        weight: 2,
                        dashArray: '6 6',
                        opacity: 0.5,
                        fill: false,
                    }),
                }).addTo(map)

                // Build rings array for mask holes (use all polygon rings from features)
                const rings: number[][][] = []
                polygonFeatures.forEach((f) => {
                    const geom = f.geometry
                    if (geom.type === 'Polygon') {
                        // geom.coordinates is array of linear rings
                        geom.coordinates.forEach((ring: number[][]) => rings.push(ring))
                    } else if (geom.type === 'MultiPolygon') {
                        geom.coordinates.forEach((poly: number[][][]) => {
                            poly.forEach((ring: number[][]) => rings.push(ring))
                        })
                    }
                })

                // Add mask with holes
                addMaskWithHoles(rings)

                // Ensure outline is on top
                if (outlineLayer && (outlineLayer as any).bringToFront) (outlineLayer as any).bringToFront()

                // Fit map to outline bounds
                const bounds = (outlineLayer as L.GeoJSON).getBounds()
                if (bounds && bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [40, 40] })
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Error loading map.geojson', err)
            }
        }

        load()

        return () => {
            if (outlineLayer) map.removeLayer(outlineLayer)
            if (maskLayer) map.removeLayer(maskLayer)
        }
    }, [map])

    return null
}

/** Map click handler used for placing circles when selection mode is enabled */
const MapClickHandler: React.FC<{ enabled: boolean; onAdd: (latlng: [number, number]) => void }> = ({ enabled, onAdd }) => {
    useMapEvents({
        click(e) {
            if (!enabled) return
            onAdd([e.latlng.lat, e.latlng.lng])
        },
    })
    return null
}

/**
 * FetchHazards: child component (must be inside MapContainer) that listens to map moveend
 * and fetches GeoJSON features for `flood` and `landslide` layers from the backend.
 */
const FetchHazards: React.FC = () => {
    const map = useMap()
    const apiBase = (process.env.NEXT_PUBLIC_HAZARD_API_URL as string) || 'http://localhost:8000'
    const layerRefs = React.useRef<{ flood?: L.GeoJSON; landslide?: L.GeoJSON }>({})
    const timer = React.useRef<number | null>(null)

    const addGeoJsonLayer = (layerName: 'flood' | 'landslide', geojson: any) => {
        // remove old
        const prev = layerRefs.current[layerName]
        if (prev) map.removeLayer(prev)
        try {
            const g = L.geoJSON(geojson, {
                style: () => ({
                    color: layerName === 'flood' ? '#1e90ff' : '#ff8800',
                    weight: 1.5,
                    opacity: 0.8,
                    fillOpacity: 0.35,
                }),
                onEachFeature: (feature, layer) => {
                    if (feature && feature.properties) {
                        layer.bindPopup(JSON.stringify(feature.properties))
                    }
                },
            }).addTo(map)
            layerRefs.current[layerName] = g
        } catch (e) {
            console.error('Failed to add geojson layer', e)
        }
    }

    const fetchForBounds = async () => {
        const b = map.getBounds()
        const south = b.getSouth()
        const west = b.getWest()
        const north = b.getNorth()
        const east = b.getEast()
        try {
            for (const layerName of ['flood', 'landslide'] as const) {
                const urlBase = `${apiBase}/features/${layerName}?min_lat=${south}&min_lng=${west}&max_lat=${north}&max_lng=${east}&limit=2000`
                // Try compressed JSON first (server will return gzipped JSON when requested)
                const compressedUrl = `${urlBase}&format=compressed`
                try {
                    const res = await fetch(compressedUrl)
                    if (res.ok) {
                        const data = await res.json()
                        if (data && data.type === 'FeatureCollection') {
                            addGeoJsonLayer(layerName, data)
                            continue
                        }
                    }
                } catch (err) {
                    console.warn('Compressed fetch error, falling back to plain JSON', err)
                }

                // Fallback: request JSON
                try {
                    const url = urlBase
                    const res2 = await fetch(url)
                    if (!res2.ok) {
                        console.warn('Hazard fetch failed', url, res2.status)
                        continue
                    }
                    const data = await res2.json()
                    if (data && data.type === 'FeatureCollection') addGeoJsonLayer(layerName, data)
                } catch (err) {
                    console.error('Error fetching hazards (json fallback)', err)
                }
            }
        } catch (err) {
            console.error('Error fetching hazards', err)
        }
    }

    useEffect(() => {
        // initial fetch
        fetchForBounds()

        const onMove = () => {
            if (timer.current) window.clearTimeout(timer.current)
            timer.current = window.setTimeout(() => {
                fetchForBounds()
            }, 300)
        }

        map.on('moveend', onMove)
        return () => {
            map.off('moveend', onMove)
            if (timer.current) window.clearTimeout(timer.current)
            // cleanup layers
            Object.values(layerRefs.current).forEach((l) => l && map.removeLayer(l))
            layerRefs.current = {}
        }
    }, [map])

    return null
}

/**
 * Circle that supports selecting and dragging a handle to resize radius.
 */
const CircleWithHandle: React.FC<{
    c: { id: number; center: [number, number]; radius: number }
    selected: boolean
    showConnector?: boolean
    onSelect: (id: number) => void
    onUpdateRadius: (id: number, radius: number) => void
    onRemove: (id: number) => void
}> = ({ c, selected, showConnector = true, onSelect, onUpdateRadius, onRemove }) => {
    const map = useMap()
    const centerLatLng = L.latLng(c.center[0], c.center[1])

    // handle position at bearing 90° (east)
    const handlePos = destinationPoint(centerLatLng.lat, centerLatLng.lng, c.radius, 90)

    // small icon for handle
    const handleIcon = L.divIcon({
        className: 'handle-div-icon',
        html: '<div style="width:12px;height:12px;border-radius:9999px;background:#10b981;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    })

    return (
        <>
            <Circle
                center={c.center}
                radius={c.radius}
                pathOptions={{ color: '#10b981', fillColor: 'rgba(16,185,129,0.06)' }}
                eventHandlers={{ click: () => onSelect(c.id) }}
            >
                <Popup>
                    <div className="text-sm">
                        Pickup point
                        <br />
                        Radius: {Math.round(c.radius)} m
                        <br />
                        <button className="mt-1 px-2 py-1 rounded bg-red-500 text-white text-xs" onClick={() => onRemove(c.id)}>
                            Remove
                        </button>
                    </div>
                </Popup>
            </Circle>

            {selected && (
                <>
                    {showConnector && (
                        <Polyline
                            positions={[[centerLatLng.lat, centerLatLng.lng], [handlePos.lat, handlePos.lng]]}
                            pathOptions={{ color: '#10b981', dashArray: '4 4', weight: 2 }}
                        />
                    )}
                    <Marker
                        position={[handlePos.lat, handlePos.lng]}
                        icon={handleIcon}
                        draggable={true}
                        eventHandlers={{
                            drag(e) {
                                const latlng = (e.target as any).getLatLng()
                                const newRadius = map.distance(centerLatLng, latlng)
                                onUpdateRadius(c.id, newRadius)
                            },
                            dragend(e) {
                                const latlng = (e.target as any).getLatLng()
                                const newRadius = map.distance(centerLatLng, latlng)
                                onUpdateRadius(c.id, newRadius)
                            },
                        }}
                    />
                </>
            )}
        </>
    )
}

/**
 * Main Leaflet Map Component for the GIS Dashboard.
 * Initializes map container, renders overlays, and provides a small selection UI.
 */
type EvacCenter = { id: number; name?: string; center?: [number, number]; coordinates?: [number, number]; capacity?: string }

const MapComponent: React.FC<{ centers?: Array<any> }> = ({ centers = [] }) => {
    const [selectionMode, setSelectionMode] = useState(false)
    const [showConnector, setShowConnector] = useState(true)
    const [circles, setCircles] = useState<Array<{ id: number; center: [number, number]; radius: number }>>([])
    const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null)

    const addCircle = useCallback((center: [number, number]) => {
        setCircles((s) => [...s, { id: Date.now(), center, radius: 300 }])
    }, [])

    const removeCircle = useCallback((id: number) => {
        setCircles((s) => s.filter((c) => c.id !== id))
        setSelectedCircleId((cur) => (cur === id ? null : cur))
    }, [])

    const selectCircle = useCallback((id: number) => {
        setSelectedCircleId(id)
    }, [])

    const updateRadius = useCallback((id: number, radius: number) => {
        setCircles((s) => s.map((c) => (c.id === id ? { ...c, radius } : c)))
    }, [])

    const clearCircles = useCallback(() => setCircles([]), [])

    return (
        <div className="relative h-full w-full">
            <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url={CANVAS_TILE_URL} attribution={CANVAS_ATTRIBUTION} maxZoom={19} />

                {/* Fetch and render hazard features from backend dynamically (only features inside current bounds) */}
                <FetchHazards />

                {/* Render the GeoJSON outline + mask */}
                <GeoJsonOutline />

                {/* Typhoon Track Polyline (example overlay) */}
                <Polyline positions={simulatedTyphoonTrack} color="red" weight={4} opacity={0.7} />

                {/* High-Priority Evacuation Zone Marker */}
                <Marker position={highRiskZone.position}>
                    <Popup>
                        <strong>{highRiskZone.label}</strong>
                        <br />
                        {highRiskZone.popup}
                    </Popup>
                </Marker>

                {/* Render user-placed circles with draggable handle when selected */}
                {circles.map((c) => (
                    <CircleWithHandle
                        key={c.id}
                        c={c}
                        selected={selectedCircleId === c.id}
                        showConnector={showConnector}
                        onSelect={selectCircle}
                        onUpdateRadius={updateRadius}
                        onRemove={removeCircle}
                    />
                ))}

                {/* Evacuation site markers passed from parent */}
                {centers.map((ct: any) => {
                    const pos = ct.coordinates || ct.center || ct.location
                    if (!pos) return null
                    return (
                        <Marker key={`evac-${ct.id}`} position={pos}>
                            <Popup>
                                <div className="text-sm">
                                    <strong>{ct.name || ct.title || 'Evac Center'}</strong>
                                    <div className="text-xs">{ct.capacity || ''}</div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {/* Map click handler must be inside MapContainer */}
                <MapClickHandler enabled={selectionMode} onAdd={addCircle} />
            </MapContainer>

            {/* Overlay controls */}
            <div className="absolute top-4 right-4 z-50">
                <div className="bg-white/90 p-2 rounded shadow-md flex flex-col gap-2">
                    <button
                        onClick={() => setSelectionMode((s) => !s)}
                        className={`px-3 py-1 rounded text-sm ${selectionMode ? 'bg-red-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                        {selectionMode ? 'Selection: ON' : 'Enable Selection'}
                    </button>
                    <div className="flex gap-2">
                        <button onClick={clearCircles} className="px-3 py-1 rounded text-sm bg-white text-slate-700">
                            Clear Circles
                        </button>
                        <button onClick={() => setShowConnector((s) => !s)} className="px-3 py-1 rounded text-sm bg-white text-slate-700">
                            {showConnector ? 'Hide Connector' : 'Show Connector'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapComponent;
