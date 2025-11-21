"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EvacuationCenterItem } from '../dashboard/EvacuationCenterItem'
// geojson-vt is used to tile large GeoJSON client-side for fast rendering
// @ts-ignore: geojson-vt has no types in this project
import geojsonvt from 'geojson-vt'
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

// --- Typhoon Data Simulation ---
// Initial center for the map (Manila area, Philippines)
const initialCenter: [number, number] = [14.5995, 120.9842];
const initialZoom = 30;

// Simulated GeoJSON-like data for a Typhoon Track Polyline
const simulatedTyphoonTrack: [number, number][] = [
    [15.5, 122.0],
    [14.8, 121.5],
    [14.4, 120.9],
    [14.2, 120.3],
];

// (Removed hard-coded evacuation marker) User will place evacuation centers on the map.

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
const FetchHazards: React.FC<{ visibleFilter: 'all' | 'flood' | 'landslide'; setVisibleFilter: (v: 'all' | 'flood' | 'landslide') => void }> = ({ visibleFilter, setVisibleFilter }) => {
    const map = useMap()
    // We no longer use the backend. Load static processed files from the public folder.
    const layerSources: Record<'flood' | 'landslide', string> = {
        flood: '/processed_data/Laguna_Flood_5year.geojson',
        landslide: '/processed_data/Laguna_LandslideHazards.geojson',
    }
    const layerRefs = React.useRef<Record<string, any>>({})
    const timer = React.useRef<number | null>(null)

    const canvasRenderer = L.canvas({ padding: 0.5 })

    const getHazardLevel = (feature: any): number | null => {
        if (!feature || !feature.properties) return null
        const p = feature.properties
        const keys = ['hazard_level', 'level', 'intensity', 'risk', 'HAZARD', 'LEVEL', 'RISK', 'var', 'Var']
        for (const k of keys) {
            if (k in p) {
                const v = p[k]
                const n = Number(v)
                if (!Number.isNaN(n)) return Math.max(1, Math.min(3, Math.round(n)))
                const s = String(v).toLowerCase()
                if (s.includes('low')) return 1
                if (s.includes('med') || s.includes('medium')) return 2
                if (s.includes('high') || s.includes('3')) return 3
            }
        }
        return null
    }

    // Brighter/more saturated colors for higher intensity levels
    const styleForFeature = (layerName: 'flood' | 'landslide') => (feature: any) => {
        const level = getHazardLevel(feature) || 2
        const fillMap: Record<'flood' | 'landslide', Record<number, string>> = {
            flood: { 1: '#cceeff', 2: '#66b3ff', 3: '#0066ff' },
            landslide: { 1: '#fff0e0', 2: '#ffb366', 3: '#ff5500' },
        }
        // stroke (outline) colors chosen darker for better contrast against fill
        const strokeMap: Record<'flood' | 'landslide', Record<number, string>> = {
            flood: { 1: '#99d6ff', 2: '#3399ff', 3: '#0033cc' },
            landslide: { 1: '#e6d2bb', 2: '#cc8833', 3: '#cc3300' },
        }
        // stronger fill opacity for higher intensity
        const opacityMap: Record<number, number> = { 1: 0.4, 2: 0.55, 3: 0.7 }
        const fillColor = (fillMap[layerName] && fillMap[layerName][level]) || (layerName === 'flood' ? '#66b3ff' : '#ffb366')
        const strokeColor = (strokeMap[layerName] && strokeMap[layerName][level]) || fillColor
        const fillOpacity = opacityMap[level] ?? 0.6
        return {
            color: strokeColor,
            weight: 1,
            opacity: Math.min(0.95, fillOpacity * 0.8),
            fillColor,
            fillOpacity,
        }
    }

    const addGeoJsonLayer = (layerName: 'flood' | 'landslide', geojson: any) => {
        // remove old
        const prev = layerRefs.current[layerName]
        if (prev) {
            if (prev.tileLayer) try { map.removeLayer(prev.tileLayer) } catch (e) {}
            if (prev.geo) try { map.removeLayer(prev.geo) } catch (e) {}
        }
        try {
            const featuresCount = Array.isArray(geojson.features) ? geojson.features.length : 0
            const bindPopups = featuresCount <= 500

            // If geojson-vt is available, create a tile index and render with a GridLayer canvas renderer
            let tileLayer: L.GridLayer | null = null
            try {
                // Increase maxZoom so tiles remain visible when zooming very far in
                const idx = (geojsonvt as any)(geojson, { maxZoom: 24, tolerance: 3, extent: 4096 })

                const createTile = (coords: any) => {
                    const tile = document.createElement('canvas')
                    const size = 256
                    tile.width = size
                    tile.height = size
                    const ctx = tile.getContext('2d')
                    if (!ctx) return tile

                    const z = coords.z
                    const x = coords.x
                    const y = coords.y
                    // Ensure we request tiles within the indexed maxZoom. If user zooms past maxZoom, geojson-vt
                    // should still return a tile by requesting the top-level tile for the higher zoom.
                    const maxZ = idx.options && idx.options.maxZoom ? idx.options.maxZoom : 24
                    const useZ = Math.min(z, maxZ)
                    // If z > maxZ, map x/y to the corresponding tile at maxZ
                    let tx = x
                    let ty = y
                    if (z > useZ) {
                        const factor = 1 << (z - useZ)
                        tx = Math.floor(x / factor)
                        ty = Math.floor(y / factor)
                    }
                    const tileData = idx.getTile(useZ, tx, ty)
                    if (!tileData || !tileData.features) return tile

                    const extent = idx.options.extent || 4096
                    // When z > indexed maxZ we scaled down; account for that by adjusting scale
                    const scale = size / extent

                    ctx.clearRect(0, 0, size, size)
                    ctx.lineJoin = 'round'
                    ctx.lineCap = 'round'

                    for (const f of tileData.features) {
                        // f has geometry as array of rings/lines in tile coords
                        const props = f.tags || f.properties || {}
                        // create a fake GeoJSON feature for styling
                        const fakeFeat = { type: 'Feature', properties: props }
                        const style = styleForFeature(layerName)(fakeFeat)

                        if (f.type === 3 || f.type === 2) {
                            // Polygon or MultiPolygon (geojson-vt encodes polygons as type 3)
                            ctx.beginPath()
                            for (const ring of f.geometry) {
                                let first = true
                                for (const p of ring) {
                                    const px = p[0] * scale
                                    const py = p[1] * scale
                                    if (first) {
                                        ctx.moveTo(px, py)
                                        first = false
                                    } else {
                                        ctx.lineTo(px, py)
                                    }
                                }
                            }
                            // fill
                            try {
                                ctx.fillStyle = (style.fillColor || style.color) ?? '#000'
                                ctx.globalAlpha = style.fillOpacity ?? 0.6
                                ctx.fill()
                            } finally {
                                ctx.globalAlpha = 1
                            }
                            // stroke
                            ctx.strokeStyle = style.color || '#000'
                            ctx.lineWidth = style.weight ?? 1
                            ctx.globalAlpha = style.opacity ?? 0.6
                            ctx.stroke()
                            ctx.globalAlpha = 1
                        } else if (f.type === 2) {
                            // LineString
                            ctx.beginPath()
                            for (const ring of f.geometry) {
                                let first = true
                                for (const p of ring) {
                                    const px = p[0] * scale
                                    const py = p[1] * scale
                                    if (first) {
                                        ctx.moveTo(px, py)
                                        first = false
                                    } else {
                                        ctx.lineTo(px, py)
                                    }
                                }
                            }
                            ctx.strokeStyle = style.color || '#000'
                            ctx.lineWidth = style.weight ?? 1
                            ctx.globalAlpha = style.opacity ?? 0.8
                            ctx.stroke()
                            ctx.globalAlpha = 1
                        }
                    }
                    return tile
                }

                tileLayer = L.gridLayer({ pane: 'overlayPane', tileSize: 256 })
                // @ts-ignore attach createTile
                tileLayer.createTile = createTile
                const shouldShow = visibleFilter === 'all' || visibleFilter === layerName
                if (shouldShow) tileLayer.addTo(map)
                layerRefs.current[layerName] = { idx, tileLayer, geo: null }
            } catch (err) {
                // fallback to geoJSON (canvas renderer)
                const g = L.geoJSON(geojson, ({
                    renderer: canvasRenderer,
                    style: styleForFeature(layerName),
                    interactive: bindPopups,
                    onEachFeature: bindPopups
                        ? (feature: any, layer: L.Layer) => {
                              if (feature && feature.properties) {
                                  layer.bindPopup(JSON.stringify(feature.properties))
                              }
                          }
                        : undefined,
                } as any))
                const shouldShowGeo = visibleFilter === 'all' || visibleFilter === layerName
                if (shouldShowGeo) g.addTo(map)
                layerRefs.current[layerName] = { idx: null, tileLayer: null, geo: g }
            }
        } catch (e) {
            console.error('Failed to add geojson layer', e)
        }
    }

    // Helper: compute bbox of a GeoJSON feature (minLat, minLng, maxLat, maxLng)
    const featureBBox = (feature: any) => {
        const coordsArray: number[][] = []
        const collect = (g: any) => {
            if (!g) return
            if (g.type === 'Point') coordsArray.push([g.coordinates[1], g.coordinates[0]])
            else if (g.type === 'MultiPoint' || g.type === 'LineString') {
                for (const c of g.coordinates) coordsArray.push([c[1], c[0]])
            } else if (g.type === 'MultiLineString' || g.type === 'Polygon') {
                for (const part of g.coordinates) {
                    if (Array.isArray(part[0])) {
                        for (const c of part) coordsArray.push([c[1], c[0]])
                    } else {
                        coordsArray.push([part[1], part[0]])
                    }
                }
            } else if (g.type === 'MultiPolygon') {
                for (const poly of g.coordinates) for (const ring of poly) for (const c of ring) coordsArray.push([c[1], c[0]])
            }
        }
        collect(feature.geometry)
        if (coordsArray.length === 0) return null
        let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
        for (const c of coordsArray) {
            const lat = c[0], lng = c[1]
            if (lat < minLat) minLat = lat
            if (lng < minLng) minLng = lng
            if (lat > maxLat) maxLat = lat
            if (lng > maxLng) maxLng = lng
        }
        return { minLat, minLng, maxLat, maxLng }
    }

    // Fetch features once for a provided bbox (south, west, north, east)
    const fetchForBBox = async (south: number, west: number, north: number, east: number) => {
        try {
            for (const layerName of ['flood', 'landslide'] as const) {
                const src = layerSources[layerName]
                try {
                    const res = await fetch(src)
                    if (!res.ok) {
                        console.warn('Failed to fetch static layer', src, res.status)
                        continue
                    }
                    const data = await res.json()
                    if (!data || !Array.isArray(data.features)) continue

                    // Filter features by bbox overlap with the map.geojson bounds
                    const filtered = data.features.filter((f: any) => {
                        const fb = featureBBox(f)
                        if (!fb) return false
                        // overlap check
                        const overlap = !(fb.maxLat < south || fb.minLat > north || fb.maxLng < west || fb.minLng > east)
                        return overlap
                    })

                    const fc = { type: 'FeatureCollection', features: filtered }
                    addGeoJsonLayer(layerName, fc)
                } catch (err) {
                    console.error('Error loading static processed layer', layerName, err)
                }
            }
        } catch (err) {
            console.error('Error fetching hazards', err)
        }
    }

    useEffect(() => {
        // One-time load: fetch bounds from /map.geojson and fetch hazards within that bbox
        let cancelled = false

        const init = async () => {
            try {
                const res = await fetch('/map.geojson')
                if (!res.ok) throw new Error(`Failed to fetch map.geojson: ${res.status}`)
                const mapData = await res.json()
                // compute bounds via a temporary geoJSON layer
                const tmp = L.geoJSON(mapData)
                const bounds = tmp.getBounds()
                if (!bounds || !bounds.isValid()) {
                    console.warn('map.geojson bounds invalid, defaulting to visible map bounds')
                    const b = map.getBounds()
                    await fetchForBBox(b.getSouth(), b.getWest(), b.getNorth(), b.getEast())
                } else {
                    const south = bounds.getSouth()
                    const west = bounds.getWest()
                    const north = bounds.getNorth()
                    const east = bounds.getEast()
                    if (!cancelled) await fetchForBBox(south, west, north, east)
                }
            } catch (err) {
                console.error('Error initializing hazard fetch', err)
                // fallback to current visible bounds
                try {
                    const b = map.getBounds()
                    await fetchForBBox(b.getSouth(), b.getWest(), b.getNorth(), b.getEast())
                } catch (e) {
                    console.error('Fallback fetch failed', e)
                }
            }
        }

        init()

        return () => {
            cancelled = true
            // cleanup layers
            Object.values(layerRefs.current).forEach((entry: any) => {
                if (!entry) return
                if (entry.tileLayer) try { map.removeLayer(entry.tileLayer) } catch (e) {}
                if (entry.geo) try { map.removeLayer(entry.geo) } catch (e) {}
            })
            layerRefs.current = {}
        }
    }, [map])

    // Toggle layer visibility when `visibleFilter` changes
    useEffect(() => {
        for (const layerName of ['flood', 'landslide'] as const) {
            const entry = layerRefs.current[layerName]
            if (!entry) continue
            const shouldShow = visibleFilter === 'all' || visibleFilter === layerName
            try {
                if (entry.tileLayer) {
                    if (shouldShow && !map.hasLayer(entry.tileLayer)) map.addLayer(entry.tileLayer)
                    if (!shouldShow && map.hasLayer(entry.tileLayer)) map.removeLayer(entry.tileLayer)
                }
                if (entry.geo) {
                    if (shouldShow && !map.hasLayer(entry.geo)) map.addLayer(entry.geo)
                    if (!shouldShow && map.hasLayer(entry.geo)) map.removeLayer(entry.geo)
                }
            } catch (e) {
                // ignore
            }
        }
    }, [visibleFilter, map])

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
type EvacCenter = { id: string | number; name?: string; center?: [number, number]; coordinates?: [number, number]; capacity?: number; standby?: number }

import { useEvacContext } from '../evac/EvacContext'

type MapProps = {
    centers?: Array<any>
    selectionMode?: boolean
    setSelectionMode?: (v: boolean) => void
    addCenterMode?: boolean
    setAddCenterMode?: (v: boolean) => void
    visibleFilter?: 'all' | 'flood' | 'landslide'
    setVisibleFilter?: (v: 'all' | 'flood' | 'landslide') => void
    showConnector?: boolean
    setShowConnector?: (v: boolean) => void
    clearCircles?: () => void
    clearSignal?: number
    flyToLocation?: [number, number] | null
    onRequestDelete?: (center: any) => void
}

const MapComponent: React.FC<MapProps> = ({ centers = [], selectionMode: propSelectionMode, setSelectionMode: propSetSelectionMode, addCenterMode: propAddCenterMode, setAddCenterMode: propSetAddCenterMode, visibleFilter: propVisibleFilter, setVisibleFilter: propSetVisibleFilter, showConnector: propShowConnector, setShowConnector: propSetShowConnector, clearCircles: propClearCircles, clearSignal: propClearSignal, flyToLocation, onRequestDelete }) => {
    const [localVisibleFilter, setLocalVisibleFilter] = useState<'all' | 'flood' | 'landslide'>('all')
    const [localAddCenterMode, setLocalAddCenterMode] = useState(false)
    const { centers: ctxCenters, addCenter, removeCenter, openEditModal } = useEvacContext()
    const [userCenters, setUserCenters] = useState<Array<EvacCenter>>(ctxCenters || [])
    const apiBase = (process.env.NEXT_PUBLIC_HAZARD_API_URL as string) || 'http://localhost:8000'

    // Provide prop-backed or local-backed control values
    const addCenterMode = typeof propAddCenterMode === 'boolean' ? propAddCenterMode : localAddCenterMode
    const setAddCenterMode = propSetAddCenterMode ?? setLocalAddCenterMode
    const visibleFilter = propVisibleFilter ?? localVisibleFilter
    const setVisibleFilter = propSetVisibleFilter ?? setLocalVisibleFilter

    // sync local userCenters with context centers
    useEffect(() => {
        setUserCenters(ctxCenters || [])
    }, [ctxCenters])

    // No local edit modal; use shared EvacContext modal

    // Custom icon for evacuation centers
    const evacIcon = L.divIcon({
        className: 'custom-evac-icon',
        html: `<div style="background-color: #0ea5e9; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    })

    const MapController = () => {
        const map = useMap()
        useEffect(() => {
            if (flyToLocation) {
                map.flyTo(flyToLocation, 16)
            }
        }, [flyToLocation, map])
        return null
    }

    return (
        <div className="relative h-full w-full">
            <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }} preferCanvas={true}>
                <MapController />
                <TileLayer url={CANVAS_TILE_URL} attribution={CANVAS_ATTRIBUTION} maxZoom={19} />

                {/* Fetch and render hazard features from static processed files under /public */}
                <FetchHazards visibleFilter={visibleFilter} setVisibleFilter={setVisibleFilter} />

                {/* Render the GeoJSON outline + mask */}
                <GeoJsonOutline />

                {/* Typhoon Track Polyline (example overlay) */}
                <Polyline positions={simulatedTyphoonTrack} color="red" weight={4} opacity={0.7} />

                {/* User-placed evacuation centers (from shared context) */}
                {userCenters.map((ct) => (
                    <Marker key={`user-evac-${ct.id}`} position={ct.center as any} icon={evacIcon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>{ct.name || 'Evac Center'}</strong>
                                <div className="text-xs">{ct.capacity || ''}</div>
                                <div className="mt-2">
                                    <button
                                        className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                                        onClick={() => {
                                            if (onRequestDelete) onRequestDelete(ct)
                                            else {
                                                removeCenter(ct.id)
                                            }
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Selection/circle UI removed */}

                {/* Evacuation site markers passed from parent */}
                {centers.map((ct: any) => {
                    const pos = ct.coordinates || ct.center || ct.location
                    if (!pos) return null
                    return (
                        <Marker key={`evac-${ct.id}`} position={pos} icon={evacIcon}>
                            <Popup>
                                <div className="text-sm">
                                    <strong>{ct.name || ct.title || 'Evac Center'}</strong>
                                    <div className="text-xs">{ct.capacity || ''}</div>
                                    <div className="mt-2">
                                        <button
                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                                            onClick={() => {
                                                if (onRequestDelete) onRequestDelete(ct)
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {/* Map click handler for adding center (opens modal with picked coords) */}
                <MapClickHandler
                    enabled={addCenterMode}
                    onAdd={async (latlng) => {
                        try {
                            openEditModal({ center: latlng })
                        } catch (err) {
                            console.error('Failed to open edit modal for new center', err)
                        } finally {
                            setAddCenterMode(false)
                        }
                    }}
                />
            </MapContainer>

            {/* Map-only UI removed: legend and side panel moved to parent dashboard */}
        </div>
    )
}

export default MapComponent;
