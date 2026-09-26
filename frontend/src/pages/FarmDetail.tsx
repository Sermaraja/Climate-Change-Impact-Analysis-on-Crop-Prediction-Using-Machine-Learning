import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import { PageHeader } from '../components/common/PageHeader';
import { MapPin, Sprout, Trash2, ArrowLeft, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { apiClient } from '../services/api';
import type { FarmCropData } from '../types/crop';
import { CropCard } from '../components/crops/CropCard';
import { SoilCard } from '../components/soil/SoilCard';
import { WaterloggingCard } from '../components/waterlogging/WaterloggingCard';
import { CropDamageCard } from '../components/damage/CropDamageCard';



export interface FarmDetailData {
  id: number;
  user_id: number;
  farm_name: string;
  latitude: number;
  longitude: number;
  boundary_geojson: any | null;
  area_acres: number;
  area_hectares: number;
  state?: string;
  district?: string;
  village?: string;
  drainage_class?: string;
  created_at: string;
}

export const FarmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const farmId = Number(id);

  // 1. Fetch Farm GIS metadata
  const { data: farm, isLoading: isLoadingFarm, isError: isErrorFarm, error: farmError } = useQuery<FarmDetailData>({
    queryKey: ['farm', id],
    queryFn: async () => {
      const response = await apiClient.get<FarmDetailData>(`/farms/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Active Crop Profile for Farm
  const { data: farmCrop, refetch: refetchCrop } = useQuery<FarmCropData | null>({
    queryKey: ['farmCrop', id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<FarmCropData>(`/farms/${id}/crop`);
        return response.data;
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!id,
  });


  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/farms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      navigate('/farms');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this farm boundary from your account?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoadingFarm) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-8 h-8 text-crop-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading Farm GIS Details...</p>
      </div>
    );
  }

  if (isErrorFarm || !farm) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Farm Not Found</h2>
        <p className="text-xs text-slate-400">
          {(farmError as any)?.response?.data?.detail || 'Farm does not exist or you do not have permission to view it.'}
        </p>
        <Link to="/farms" className="inline-flex items-center gap-2 text-xs font-semibold text-crop-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to My Farms
        </Link>
      </div>
    );
  }

  // Parse polygon coordinates for Leaflet
  let polygonPositions: [number, number][] = [];
  if (farm.boundary_geojson && farm.boundary_geojson.coordinates) {
    const rawCoords = farm.boundary_geojson.coordinates[0];
    polygonPositions = rawCoords.map((coord: [number, number]) => [coord[1], coord[0]]);
  }

  const center: [number, number] = [farm.latitude, farm.longitude];

  return (
    <div className="space-y-6">
      <PageHeader
        title={farm.farm_name}
        subtitle={`${farm.district || ''}, ${farm.state || ''} (${farm.latitude}° N, ${farm.longitude}° E)`}
        badge={`${farm.area_acres} Acres / ${farm.area_hectares} Ha`}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/rain-impact"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Assess Rain Impact</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        }
      />

      {/* Stage 5: Crop Profile & Growth Stage Section */}
      <CropCard farmId={farmId} crop={farmCrop || null} onRefresh={refetchCrop} />

      {/* Stage 6: Soil Profile Section */}
      <SoilCard farmId={farmId} />

      {/* Stage 9 & Stage 11: Waterlogging Risk & ML Crop Damage Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterloggingCard farmId={farmId} />
        <CropDamageCard farmId={farmId} />
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Metadata Card */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-crop-400" /> GIS Plot Attributes
          </h2>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Area (Acres):</span>
              <span className="font-bold text-white">{farm.area_acres} Acres</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Area (Hectares):</span>
              <span className="font-bold text-crop-300">{farm.area_hectares} Ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Soil Drainage Class:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  farm.drainage_class === 'POOR'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : farm.drainage_class === 'GOOD'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {farm.drainage_class || 'MODERATE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Village / Town:</span>
              <span className="font-medium text-slate-200">{farm.village || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">District:</span>
              <span className="font-medium text-slate-200">{farm.district || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State:</span>
              <span className="font-medium text-slate-200">{farm.state || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Centroid Coordinates:</span>
              <span className="font-mono text-slate-300">
                {farm.latitude}°, {farm.longitude}°
              </span>
            </div>
          </div>
        </div>

        {/* Saved Leaflet Polygon Map */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-crop-400" /> Stored PostGIS Polygon Boundary
          </h2>

          <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 relative z-0">
            <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center}>
                <Popup>
                  {farm.farm_name} <br /> {farm.area_acres} Acres
                </Popup>
              </Marker>

              {polygonPositions.length > 0 && (
                <Polygon
                  positions={polygonPositions}
                  pathOptions={{
                    color: '#22c55e',
                    fillColor: '#22c55e',
                    fillOpacity: 0.4,
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
