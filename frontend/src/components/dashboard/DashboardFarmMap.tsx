import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Droplets, Compass } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardFarmMapProps {
  farm: {
    id: number;
    farm_name: string;
    latitude: number;
    longitude: number;
    boundary_geojson?: any;
    area_acres?: number;
    district?: string;
  };
  rainRisk?: string;
  moistureIndex?: number;
}

// Map helper to auto-fit polygon bounds
function MapBoundsFitter({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

export const DashboardFarmMap: React.FC<DashboardFarmMapProps> = ({ farm, rainRisk = 'LOW', moistureIndex = 21.4 }) => {
  const { t, translateRisk, language } = useLanguage();
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets'>('satellite');

  // Extract coordinates from boundary_geojson
  let polygonPositions: [number, number][] = [];
  try {
    if (farm.boundary_geojson && farm.boundary_geojson.coordinates) {
      const coords = farm.boundary_geojson.coordinates[0];
      polygonPositions = coords.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
    }
  } catch (e) {
    console.error('Failed to parse farm polygon:', e);
  }

  // Fallback polygon if no coordinates stored
  if (polygonPositions.length === 0) {
    const lat = farm.latitude || 10.787;
    const lng = farm.longitude || 79.1378;
    const delta = 0.003;
    polygonPositions = [
      [lat - delta, lng - delta],
      [lat + delta, lng - delta],
      [lat + delta * 1.2, lng + delta],
      [lat - delta * 0.8, lng + delta * 1.1],
      [lat - delta, lng - delta],
    ];
  }

  const bounds = polygonPositions.length > 0 ? L.latLngBounds(polygonPositions) : null;
  const centerLat = farm.latitude || (polygonPositions[0] ? polygonPositions[0][0] : 10.787);
  const centerLng = farm.longitude || (polygonPositions[0] ? polygonPositions[0][1] : 79.1378);

  const tileUrl =
    mapLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    mapLayer === 'satellite'
      ? '&copy; Esri &mdash; Earthstar Geographics'
      : '&copy; OpenStreetMap contributors &copy; CARTO';

  return (
    <div className="relative w-full h-[320px] lg:h-[370px] rounded-2xl overflow-hidden border border-[#e5ede8] bg-white shadow-xs">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />
        {bounds && <MapBoundsFitter bounds={bounds} />}

        {polygonPositions.length > 0 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#22c55e',
              fillColor: '#16a34a',
              fillOpacity: 0.35,
              weight: 3,
              dashArray: '4, 4',
            }}
          >
            <Popup className="rounded-xl">
              <div className="p-1 text-slate-800 text-xs">
                <p className="font-bold text-sm text-emerald-800">{farm.farm_name}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {farm.area_acres || 4.5} {t('units.acres', 'Acres')} • {farm.district || 'Thanjavur'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {language === 'ta' ? 'செயலில் உள்ள பயிர் மண்டலம்' : 'Active Field Parcel'}
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        <Marker position={[centerLat, centerLng]}>
          <Popup>
            <div className="p-1 text-xs">
              <p className="font-bold text-slate-900">{farm.farm_name}</p>
              <p className="text-emerald-700 font-semibold text-[11px]">
                {t('impact_metrics.app_impact_risk')}: {translateRisk(rainRisk)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Map Controls & Overlays (Exact Reference 1 Design) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Layer Selector Pill */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-md flex items-center gap-1">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              mapLayer === 'satellite'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('dashboard.satellite_layer', 'Satellite')}
          </button>
          <button
            onClick={() => setMapLayer('streets')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              mapLayer === 'streets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('dashboard.streets_layer', 'Streets')}
          </button>
        </div>
      </div>

      {/* Center Floating Moisture Badge (Reference 1 Master Element) */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-emerald-900/85 backdrop-blur-md border border-emerald-500/40 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Droplets className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                {t('soil.soil_moisture', 'Soil Moisture')}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-white">{moistureIndex}%</span>
              <span className="text-[10px] text-emerald-200 font-medium">
                ({t('dashboard.optimal', 'Optimal')})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Parcel Markers */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-800 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Field 01 • {farm.farm_name}</span>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-600 font-medium">
          {farm.area_acres || 4.5} {t('units.acres', 'Acres')}
        </div>
      </div>

      {/* Bottom Right Fullscreen / Fit Target */}
      <div className="absolute bottom-4 right-4 z-20">
        <button
          onClick={() => {
            const mapContainer = document.querySelector('.leaflet-container') as any;
            if (mapContainer && mapContainer._leaflet_map && bounds) {
              mapContainer._leaflet_map.fitBounds(bounds, { padding: [30, 30] });
            }
          }}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md transition-all cursor-pointer"
          title={t('dashboard.fit_bounds', 'Fit Farm Boundary')}
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
