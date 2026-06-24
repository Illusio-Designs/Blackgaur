'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Recentre the map when the set of positions changes.
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.setView([positions[0].latitude, positions[0].longitude], 9);
    } else {
      const bounds = positions.map((p) => [p.latitude, p.longitude]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

/**
 * Live vehicle map (Leaflet + OpenStreetMap tiles — no API key required).
 * Client-only; import via next/dynamic with { ssr: false }.
 */
export default function LiveMap({ positions = [], speedLabel = 'km/h' }) {
  const center = positions.length
    ? [positions[0].latitude, positions[0].longitude]
    : [22.6, 71.8]; // Gujarat fallback

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full" style={{ minHeight: 420 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
      {positions.map((p) => (
        <CircleMarker
          key={p.vehicle_id}
          center={[p.latitude, p.longitude]}
          radius={9}
          pathOptions={{ color: '#1A56DB', weight: 2, fillColor: '#1A56DB', fillOpacity: 0.85 }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
            <span className="font-mono text-xs font-semibold">{p.registration_no}</span>
          </Tooltip>
          <Popup>
            <div className="text-xs">
              <div className="font-mono font-semibold text-brand-navy">{p.registration_no}</div>
              {p.driver?.name && <div>{p.driver.name}</div>}
              {p.trip?.lr_number && (
                <div className="text-brand-muted">
                  {p.trip.lr_number} · {p.trip.origin_city} → {p.trip.destination_city}
                </div>
              )}
              {p.speed_kmph != null && <div>{p.speed_kmph} {speedLabel}</div>}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
