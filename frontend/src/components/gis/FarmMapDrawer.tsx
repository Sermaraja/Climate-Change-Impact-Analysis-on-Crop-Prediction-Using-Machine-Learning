import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Trash2, Undo2, Layers, CheckCircle2 } from 'lucide-react';

// Fix Leaflet default marker icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface FarmMapDrawerProps {
  onBoundaryChange: (data: {
    boundaryGeoJSON: any | null;
    latitude: number;
    longitude: number;
    areaAcres: number;
    areaHectares: number;
  }) => void;
  initialPolygon?: [number, number][];
}

// Calculate geodesic area of polygon in square meters, then convert to acres & hectares
function calculatePolygonArea(latLngs: [number, number][]): { acres: number; hectares: number } {
  if (latLngs.length < 3) return { acres: 0, hectares: 0 };

  const radius = 6378137; // Earth's radius in meters
  let area = 0;

  for (let i = 0; i < latLngs.length; i++) {
    const j = (i + 1) % latLngs.length;
    const p1 = latLngs[i];
    const p2 = latLngs[j];
    const radLat1 = (p1[0] * Math.PI) / 180;
    const radLat2 = (p2[0] * Math.PI) / 180;
    const radLng1 = (p1[1] * Math.PI) / 180;
    const radLng2 = (p2[1] * Math.PI) / 180;

    area += (radLng2 - radLng1) * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }

  area = Math.abs((area * radius * radius) / 2.0);
  const sqMeters = area;
  const acres = roundToTwo(sqMeters / 4046.8564224);
  const hectares = roundToTwo(sqMeters / 10000.0);

  return { acres, hectares };
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// Click listener component inside Leaflet map
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const FarmMapDrawer: React.FC<FarmMapDrawerProps> = ({ onBoundaryChange, initialPolygon }) => {
  // Thanjavur, Tamil Nadu default center
  const [center, setCenter] = useState<[number, number]>([10.7870, 79.1378]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>(initialPolygon || []);
  const [geoLocating, setGeoLocating] = useState(false);

  // Recalculate area and centroid whenever polygon points change
  useEffect(() => {
    if (polygonPoints.length >= 3) {
      const { acres, hectares } = calculatePolygonArea(polygonPoints);

      // Compute centroid
      const sumLat = polygonPoints.reduce((sum, p) => sum + p[0], 0);
      const sumLng = polygonPoints.reduce((sum, p) => sum + p[1], 0);
      const avgLat = roundToTwo(sumLat / polygonPoints.length);
      const avgLng = roundToTwo(sumLng / polygonPoints.length);

      // Convert to GeoJSON Polygon format [[ [lng, lat], [lng, lat], ... ]]
      const geoCoordinates = polygonPoints.map((p) => [p[1], p[0]]);
      geoCoordinates.push([polygonPoints[0][1], polygonPoints[0][0]]); // Close loop

      const geoJson = {
        type: 'Polygon',
        coordinates: [geoCoordinates],
      };

      onBoundaryChange({
        boundaryGeoJSON: geoJson,
        latitude: avgLat,
        longitude: avgLng,
        areaAcres: acres,
        areaHectares: hectares,
      });
    } else {
      onBoundaryChange({
        boundaryGeoJSON: null,
        latitude: polygonPoints.length > 0 ? polygonPoints[0][0] : center[0],
        longitude: polygonPoints.length > 0 ? polygonPoints[0][1] : center[1],
        areaAcres: 0,
        areaHectares: 0,
      });
    }
  }, [polygonPoints]);

  const handleMapClick = (lat: number, lng: number) => {
    setPolygonPoints((prev) => [...prev, [roundToTwo(lat), roundToTwo(lng)]]);
  };

  const handleUndo = () => {
    setPolygonPoints((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPolygonPoints([]);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = roundToTwo(position.coords.latitude);
        const userLng = roundToTwo(position.coords.longitude);
        setCenter([userLat, userLng]);
        setGeoLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not obtain location permissions. Using default center.');
        setGeoLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const { acres, hectares } = calculatePolygonArea(polygonPoints);

  return (
    <div className="space-y-3">
      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoLocating}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-climate-400 ${geoLocating ? 'animate-spin' : ''}`} />
            <span>{geoLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>

          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Click map to set polygon corner vertices ({polygonPoints.length} points)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={polygonPoints.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors disabled:opacity-40"
            title="Undo last vertex"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={polygonPoints.length === 0}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors disabled:opacity-40"
            title="Clear all points"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onMapClick={handleMapClick} />

          {/* Render markers for each point */}
          {polygonPoints.map((point, idx) => (
            <Marker key={idx} position={point}>
              <Popup>
                Point {idx + 1}: {point[0]}° N, {point[1]}° E
              </Popup>
            </Marker>
          ))}

          {/* Render Polygon when at least 3 points */}
          {polygonPoints.length >= 3 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.35,
                weight: 3,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Area & Coordinate Info Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-crop-400" />
          <span className="text-slate-400">Calculated Farm Area:</span>
          <span className="font-bold text-white text-sm">
            {acres} Acres <span className="text-slate-400 font-normal">({hectares} Ha)</span>
          </span>
        </div>

        {polygonPoints.length >= 3 ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Valid Closed Polygon ({polygonPoints.length} vertices)</span>
          </div>
        ) : (
          <span className="text-amber-400 text-[11px]">
            Please click at least 3 points on the map to define farm boundary polygon.
          </span>
        )}
      </div>
    </div>
  );
};
