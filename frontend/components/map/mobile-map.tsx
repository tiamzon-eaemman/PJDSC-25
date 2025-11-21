"use client"

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow })

const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#16a34a;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);"></div>',
  iconSize: [18,18],
  iconAnchor: [9,9]
})

const centerIcon = L.divIcon({
  className: 'evac-center-icon',
  html: '<div style="width:20px;height:20px;border-radius:6px;background:#0ea5e9;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);">EC</div>',
  iconSize: [20,20],
  iconAnchor: [10,10]
})

export interface MobileMapProps {
  centers: Array<{ id: string; name?: string; center?: [number, number]; capacity?: number }>
  userPosition?: [number, number] | null
}

export const MobileMap: React.FC<MobileMapProps> = ({ centers, userPosition }) => {
  const defaultCenter: [number, number] = userPosition || [14.1819, 121.2364]

  return (
    <div className="w-full h-72 rounded overflow-hidden border bg-muted">
      <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        {centers.map(c => c.center && (
          <Marker key={c.id} position={c.center} icon={centerIcon}>
            <Popup>
              <div className="text-xs">
                <strong>{c.name || 'Center'}</strong><br />
                Capacity: {c.capacity ?? '—'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MobileMap
