'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEvacCenters } from '@/hooks/useApi';
import { useEffect, useState, useMemo } from 'react';

// Fix for default marker icon
const iconPerson = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconEvac = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8H7v8"/></svg>
  </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const iconEvacClosed = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function MapInstanceSetter() {
    const map = useMap();
    useEffect(() => {
        (window as any).leafletMapInstance = map;
    }, [map]);
    return null;
}

export default function MapComponent() {
    const { centers } = useEvacCenters(60000);
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [locError, setLocError] = useState<string | null>(null);
    const [locAge, setLocAge] = useState<string | null>(null);

    // Request user location explicitly
    useEffect(() => {
        // Try to load cached location first
        try {
            const cached = localStorage.getItem('sagip_user_loc');
            if (cached) {
                const { pos, ts } = JSON.parse(cached);
                setUserPos(pos);
                const age = Math.round((Date.now() - ts) / 60000);
                setLocAge(age < 1 ? 'Just now' : `${age}m ago`);
            }
        } catch { /* ignore */ }

        if (!('geolocation' in navigator)) {
            setLocError('Geolocation unsupported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(newPos);
                setLocError(null);
                setLocAge('Live');
                try {
                    localStorage.setItem('sagip_user_loc', JSON.stringify({ pos: newPos, ts: Date.now() }));
                } catch { /* ignore */ }
            },
            (err) => {
                setLocError(err.message || 'Location access denied');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const nearest = useMemo<{ center: import('@/lib/types').EvacCenter; distanceMeters: number } | null>(() => {
        if (!userPos || centers.length === 0) return null;
        const dist = (a: [number, number], b: [number, number]) => {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const R = 6371e3; // meters
            const dLat = toRad(b[0] - a[0]);
            const dLng = toRad(b[1] - a[1]);
            const lat1 = toRad(a[0]);
            const lat2 = toRad(b[0]);
            const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(h));
        };
        let min = Infinity;
        let chosen: typeof centers[0] | null = null;
        centers.forEach(c => {
            if (c.center && c.center.length === 2) {
                const d = dist(userPos, [c.center[0], c.center[1]]);
                if (d < min) { min = d; chosen = c; }
            }
        });
        return chosen ? { center: chosen, distanceMeters: min } : null;
    }, [userPos, centers]);

    const initialCenter: [number, number] = userPos || [14.1650, 121.2420];

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={initialCenter}
                zoom={15}
                style={{ height: '100%', width: '100%', background: '#050B14' }}
                zoomControl={false}
            >
                <MapInstanceSetter />
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {userPos && (
                    <Marker position={userPos} icon={iconPerson}>
                        <Popup>
                            <div>You are here</div>
                            {locAge && <div className="text-[10px] text-gray-500">Updated: {locAge}</div>}
                        </Popup>
                    </Marker>
                )}
                {centers.filter(c => c.center && c.center.length === 2).map(c => (
                    <Marker key={c.id} position={[c.center![0], c.center![1]]} icon={c.active ? iconEvac : iconEvacClosed}>
                        <Popup className="custom-popup">
                            <div className="text-gray-900 font-bold">{c.name}</div>
                            <div className={`font-bold text-xs ${c.active ? 'text-emerald-600' : 'text-red-600'}`}>{c.active ? 'OPEN' : 'CLOSED'}{c.capacity ? ` - Cap ${c.capacity}` : ''}</div>
                            {nearest && nearest.center.id === c.id && (
                                <div className="text-blue-600 text-[10px] font-semibold mt-1">Nearest ({Math.round(nearest.distanceMeters)}m)</div>
                            )}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            {/* Location Status Banner */}
            <div className="absolute top-2 left-2 right-2 z-[60] flex justify-between items-start pointer-events-none">
                <div className="px-4 py-2 rounded-lg backdrop-blur bg-black/40 border border-white/10 pointer-events-auto">
                    <div className="text-xs font-semibold tracking-wide text-white">Location Status</div>
                    <div className="text-sm font-bold text-emerald-400">{locAge || 'Locating...'}</div>
                    {locError && <div className="text-[10px] text-yellow-400 mt-1">{locError}</div>}
                </div>
            </div>
        </div>
    );
}
