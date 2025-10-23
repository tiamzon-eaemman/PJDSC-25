"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  hazards: any[];
  evacuationCenters: any[];
  selectedLayer: string;
}

export default function MapComponent({ hazards, evacuationCenters, selectedLayer }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered on Barangay Batong Malake, Los Baños
      const map = L.map("map").setView([14.165, 121.24], 16);
      mapRef.current = map;

      // Add minimal OpenStreetMap tiles (similar to UP NOAH style)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: "map-tiles"
      }).addTo(map);

      // Create layer group for markers and hazard zones
      markersRef.current = L.layerGroup().addTo(map);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Add hazard zone overlays (UP NOAH style)
    hazards.forEach((hazard) => {
      if (!markersRef.current) return;

      const color = getHazardColor(hazard.type, hazard.severity);
      const opacity = 0.6 + (hazard.severity * 0.1); // Higher severity = more opaque
      
      let hazardGroup;
      
      // Check if hazard has polygon geometry or point geometry
      if (hazard.geometry && hazard.geometry.type === 'Polygon' && hazard.geometry.coordinates) {
        // Create polygon from GeoJSON coordinates
        const coordinates = hazard.geometry.coordinates[0];
        if (Array.isArray(coordinates)) {
          const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
          
          const polygon = L.polygon(latLngs, {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: opacity,
            className: "hazard-zone"
          });

          // Add hazard zone label
          const center = polygon.getBounds().getCenter();
          const label = L.marker([center.lat, center.lng], {
            icon: L.divIcon({
              className: "hazard-label",
              html: `<div style="
                background-color: ${color};
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                border: 1px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${hazard.type} ${hazard.severity}</div>`,
              iconSize: [60, 20],
              iconAnchor: [30, 10],
            })
          });

          hazardGroup = L.layerGroup([polygon, label]);
        }
      } else {
        // Fallback to point marker if no polygon geometry
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">${hazard.severity}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([hazard.coordinates[1], hazard.coordinates[0]], { icon });
        hazardGroup = L.layerGroup([marker]);
      }
      
      if (hazardGroup) {
        hazardGroup.bindPopup(`
          <div>
            <h3 class="font-bold text-sm">${hazard.type} Hazard Zone</h3>
            <p class="text-xs">Severity: ${hazard.severity}/5</p>
            <p class="text-xs">Source: ${hazard.source}</p>
            <p class="text-xs">Confidence: ${Math.round(hazard.confidence * 100)}%</p>
            ${hazard.affectedPopulation ? `<p class="text-xs">Affected: ${hazard.affectedPopulation} people</p>` : ''}
            <p class="text-xs">Elevation: ${hazard.elevation}m</p>
          </div>
        `);
        
        hazardGroup.addTo(markersRef.current);
      }
    });

    // Add evacuation center markers
    evacuationCenters.forEach((center) => {
      if (!markersRef.current) return;

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="
          background-color: #10b981;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        ">🏠</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([center.coordinates[1], center.coordinates[0]], { icon });
      marker.bindPopup(`
        <div>
          <h3 class="font-bold text-sm">${center.name}</h3>
          <p class="text-xs">Capacity: ${center.capacity} people</p>
          ${center.address ? `<p class="text-xs">${center.address}</p>` : ''}
        </div>
      `);
      marker.addTo(markersRef.current);
    });

    // Fit map to show all markers
    if (hazards.length > 0 || evacuationCenters.length > 0) {
      const group = new L.featureGroup();
      if (markersRef.current) {
        markersRef.current.eachLayer((layer) => {
          // Check if layer is a layerGroup and extract its layers
          if (layer instanceof L.LayerGroup) {
            layer.eachLayer((sublayer) => {
              if (sublayer instanceof L.Marker || sublayer instanceof L.Polygon) {
                group.addLayer(sublayer);
              }
            });
          } else if (layer instanceof L.Marker || layer instanceof L.Polygon) {
            group.addLayer(layer);
          }
        });
        
        if (mapRef.current && group.getLayers().length > 0) {
          try {
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
          } catch (error) {
            // Fallback: center on Batong Malake if bounds calculation fails
            mapRef.current.setView([14.165, 121.24], 16);
          }
        }
      }
    }

  }, [hazards, evacuationCenters, selectedLayer]);

  const getHazardColor = (type: string, severity: number) => {
    const colors = {
      FLOOD: severity >= 4 ? "#ef4444" : severity >= 3 ? "#f97316" : "#eab308",
      LANDSLIDE: severity >= 4 ? "#dc2626" : severity >= 3 ? "#ea580c" : "#ca8a04",
      STORM_SURGE: severity >= 4 ? "#2563eb" : severity >= 3 ? "#3b82f6" : "#60a5fa",
      WIND: severity >= 4 ? "#7c3aed" : severity >= 3 ? "#8b5cf6" : "#a78bfa"
    };
    return colors[type as keyof typeof colors] || "#6b7280";
  };

  return (
    <div className="relative h-full w-full">
      <div id="map" className="h-full w-full"></div>
      
      {/* Map overlay with legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <h4 className="text-xs font-semibold text-gray-800 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Risk (4-5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Medium Risk (3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Low Risk (1-2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🏠</div>
            <span>Evacuation Center</span>
          </div>
        </div>
      </div>

      {/* Map title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <h3 className="text-sm font-semibold text-gray-800">Barangay Batong Malake</h3>
        <p className="text-xs text-gray-600">Los Baños, Laguna - Hazard Zones</p>
      </div>
    </div>
  );
}
