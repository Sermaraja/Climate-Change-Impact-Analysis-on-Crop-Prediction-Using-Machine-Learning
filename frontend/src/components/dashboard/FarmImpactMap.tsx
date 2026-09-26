import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Compass } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface FarmImpactFeature {
  farm_id: number;
  farm_name: string;
  latitude: number;
  longitude: number;
  area_acres?: number;
  district?: string;
  state?: string;
  boundary_geojson?: any;
  has_crop: boolean;
  active_crop?: {
    crop_name: string;
    variety_name?: string;
    growth_stage?: string;
    growth_stage_source?: string;
    crop_age_days?: number;
    stage_vulnerability?: string;
  };
  crop_impact_analysis?: {
    application_impact_level: string; // GREEN, YELLOW, ORANGE, RED
    application_rain_risk?: string;
    damage_risk?: string;
    survival_potential?: string;
    recovery_potential?: string;
    crop_loss_risk?: string;
    engine_type?: string;
    model_version?: string;
  };
  waterlogging_analysis?: {
    risk_level?: string;
    soil_saturation_pct?: number;
    estimated_standing_water_hours?: number;
  };
  weather_metrics?: {
    forecast_rain_24h_mm?: number;
    forecast_rain_48h_mm?: number;
    previous_rain_48h_mm?: number;
    temperature_c?: number;
    humidity_pct?: number;
  };
  soil_profile?: {
    soil_type?: string;
    clay_percentage?: number;
    sand_percentage?: number;
    drainage_class?: string;
    soil_source?: string;
  };
  status_message?: string;
}

interface FarmImpactMapProps {
  farms: FarmImpactFeature[];
  selectedFarmId?: number | null;
  onSelectFarm?: (farmId: number) => void;
  onViewAnalysis?: (farmId: number) => void;
  onViewActions?: (farmId: number) => void;
  heightClass?: string;
}

// Helper to fit map bounds around all farm polygons
function AllFarmsBoundsFitter({ allCoords }: { allCoords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [allCoords, map]);
  return null;
}

export const FarmImpactMap: React.FC<FarmImpactMapProps> = ({
  farms = [],
  selectedFarmId,
  onSelectFarm,
  onViewAnalysis,
  onViewActions,
  heightClass = "h-[420px] lg:h-[480px]"
}) => {
  const { language, translateCrop, translateStage, translateRisk } = useLanguage();
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets'>('satellite');

  // Collect all boundary coordinates for global bounding box
  const allPoints: [number, number][] = [];

  const parsedFarms = farms.map((farm) => {
    let positions: [number, number][] = [];
    try {
      if (farm.boundary_geojson && farm.boundary_geojson.coordinates) {
        const coords = farm.boundary_geojson.coordinates[0];
        positions = coords.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
      }
    } catch (e) {
      console.error(`Failed parsing boundary for farm ${farm.farm_id}:`, e);
    }

    if (positions.length === 0) {
      const lat = farm.latitude || 10.787;
      const lng = farm.longitude || 79.1378;
      const delta = 0.003;
      positions = [
        [lat - delta, lng - delta],
        [lat + delta, lng - delta],
        [lat + delta * 1.2, lng + delta],
        [lat - delta * 0.8, lng + delta * 1.1],
        [lat - delta, lng - delta],
      ];
    }

    positions.forEach((pt) => allPoints.push(pt));

    const impactLevel = farm.crop_impact_analysis?.application_impact_level || 'UNKNOWN';

    // Visual styles per impact level
    let strokeColor = '#94a3b8';
    let fillColor = '#cbd5e1';
    let labelBg = 'bg-slate-100 text-slate-700 border-slate-300';

    if (impactLevel === 'RED') {
      strokeColor = '#dc2626';
      fillColor = '#ef4444';
      labelBg = 'bg-red-50 text-red-700 border-red-300';
    } else if (impactLevel === 'ORANGE') {
      strokeColor = '#ea580c';
      fillColor = '#f97316';
      labelBg = 'bg-amber-50 text-amber-800 border-amber-300';
    } else if (impactLevel === 'YELLOW') {
      strokeColor = '#ca8a04';
      fillColor = '#eab308';
      labelBg = 'bg-yellow-50 text-yellow-800 border-yellow-300';
    } else if (impactLevel === 'GREEN') {
      strokeColor = '#16a34a';
      fillColor = '#22c55e';
      labelBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }

    const isSelected = selectedFarmId === farm.farm_id;

    return {
      ...farm,
      positions,
      impactLevel,
      strokeColor,
      fillColor,
      labelBg,
      isSelected
    };
  });

  const defaultCenter: [number, number] =
    allPoints.length > 0
      ? [allPoints[0][0], allPoints[0][1]]
      : [10.787, 79.1378];

  const tileUrl =
    mapLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const tileAttribution =
    mapLayer === 'satellite'
      ? '&copy; Esri &mdash; Earthstar Geographics'
      : '&copy; OpenStreetMap contributors &copy; CARTO';

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-[#e5ede8] bg-white shadow-xs`}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />
        {allPoints.length > 0 && <AllFarmsBoundsFitter allCoords={allPoints} />}

        {parsedFarms.map((farm) => (
          <Polygon
            key={farm.farm_id}
            positions={farm.positions}
            eventHandlers={{
              click: () => onSelectFarm && onSelectFarm(farm.farm_id),
            }}
            pathOptions={{
              color: farm.isSelected ? '#0284c7' : farm.strokeColor,
              fillColor: farm.fillColor,
              fillOpacity: farm.isSelected ? 0.6 : 0.4,
              weight: farm.isSelected ? 4 : 2.5,
              dashArray: farm.impactLevel === 'RED' ? '3, 3' : undefined,
            }}
          >
            <Popup className="rounded-2xl max-w-[320px]">
              <div className="p-2 text-slate-800 text-xs">
                {/* Header with farm name & impact badge */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{farm.farm_name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {farm.area_acres ? `${farm.area_acres} ${language === 'ta' ? 'ஏக்கர்' : 'acres'}` : (language === 'ta' ? 'பரப்பளவு குறிப்பிடப்படவில்லை' : 'Area unspecified')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${farm.labelBg}`}
                  >
                    {translateRisk(farm.impactLevel)}
                  </span>
                </div>

                {farm.has_crop && farm.active_crop ? (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                          {language === 'ta' ? 'பயிர்' : 'Crop'}
                        </span>
                        <span className="font-medium text-slate-800">
                          {translateCrop(farm.active_crop.crop_name)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                          {language === 'ta' ? 'பருவம்' : 'Growth Stage'}
                        </span>
                        <span className="font-medium text-slate-800">
                          {translateStage(farm.active_crop.growth_stage || 'Vegetative')}
                          {farm.active_crop.growth_stage_source === 'ESTIMATED' && (
                            <span className="text-[9px] text-amber-600 block">
                              ({language === 'ta' ? 'கணிக்கப்பட்டது' : 'Estimated'})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                          {language === 'ta' ? '24 மணி நேர மழை' : '24h Forecast Rain'}
                        </span>
                        <span className="font-semibold text-sky-700">
                          {farm.weather_metrics?.forecast_rain_24h_mm ?? 0} mm
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">
                          {language === 'ta' ? 'நீர் தேக்க அபாயம்' : 'Waterlogging'}
                        </span>
                        <span className="font-medium text-slate-800">
                          {translateRisk(farm.waterlogging_analysis?.risk_level || 'LOW')}
                        </span>
                      </div>
                    </div>

                    {/* Scientific risks */}
                    <div className="text-[10px] space-y-0.5 pt-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>{language === 'ta' ? 'சேத அபாயம்:' : 'Damage Risk:'}</span>
                        <span className="font-semibold text-slate-800">
                          {translateRisk(farm.crop_impact_analysis?.damage_risk || 'LOW')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'ta' ? 'உயிர்வாழும் திறன்:' : 'Survival Potential:'}</span>
                        <span className="font-semibold text-slate-800">
                          {translateRisk(farm.crop_impact_analysis?.survival_potential || 'HIGH')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'ta' ? 'மீட்புத் திறன்:' : 'Recovery Potential:'}</span>
                        <span className="font-semibold text-slate-800">
                          {translateRisk(farm.crop_impact_analysis?.recovery_potential || 'HIGH')}
                        </span>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="pt-2 flex items-center gap-1.5 border-t border-slate-100">
                      <button
                        onClick={() => onViewAnalysis && onViewAnalysis(farm.farm_id)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold text-center transition-colors cursor-pointer"
                      >
                        {language === 'ta' ? 'முழு பகுப்பாய்வு' : 'Full Analysis'}
                      </button>
                      <button
                        onClick={() => onViewActions && onViewActions(farm.farm_id)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-semibold text-center transition-colors cursor-pointer"
                      >
                        {language === 'ta' ? 'நடவடிக்கைகள்' : 'Actions'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center">
                    <p className="text-[11px] text-amber-700 mb-2">
                      {farm.status_message || (language === 'ta' ? 'பகுப்பாய்வு செய்ய பயிரைச் சேர்க்கவும்' : 'Add crop to analyse')}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      {/* Layer Switcher */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-xs rounded-xl p-1 shadow-md border border-slate-200 flex items-center gap-1">
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              mapLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'செயற்கைக்கோள்' : 'Satellite'}
          </button>
          <button
            onClick={() => setMapLayer('streets')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
              mapLayer === 'streets'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'நிலவரைபடம்' : 'Streets'}
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs rounded-xl px-3 py-2 shadow-md border border-[#e5ede8] flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[10px] uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'ta' ? 'பண்ணை பாதிப்பு' : 'Farm Impact'}</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-red-400" />
            <span className="font-semibold text-red-700">{language === 'ta' ? 'சிவப்பு (கடுமை)' : 'Red (Severe)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-1 ring-orange-400" />
            <span className="font-semibold text-orange-700">{language === 'ta' ? 'ஆரஞ்சு (உயர்)' : 'Orange (High)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 ring-1 ring-yellow-500" />
            <span className="font-semibold text-yellow-700">{language === 'ta' ? 'மஞ்சள் (மிதம்)' : 'Yellow (Elevated)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-emerald-400" />
            <span className="font-semibold text-emerald-700">{language === 'ta' ? 'பச்சை (குறைவு)' : 'Green (Low)'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
