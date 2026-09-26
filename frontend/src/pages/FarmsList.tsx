import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, PlusCircle, Sprout, Layers, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import type { FarmDetailData } from './FarmDetail';


export const FarmsList: React.FC = () => {
  const { data: farms = [], isLoading, isError, error } = useQuery<FarmDetailData[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const response = await apiClient.get<FarmDetailData[]>('/farms');
      return response.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="My Farms"
        subtitle="Manage farm polygon boundaries, crop growth stages, and verified soil profiles"
        action={
          <Link
            to="/farms/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-crop-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Farm</span>
          </Link>
        }
      />

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-100">
          <Loader2 className="w-8 h-8 text-crop-400 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Loading your registered farms...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{(error as any)?.response?.data?.detail || 'Failed to load farms from server.'}</span>
        </div>
      )}

      {!isLoading && !isError && farms.length === 0 && (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-crop-500/10 border border-crop-500/30 text-crop-400 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">No Farms Registered Yet</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Draw your farm boundary polygon on the map to start receiving extreme rainfall impact predictions.
            </p>
          </div>
          <Link
            to="/farms/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-crop-600 hover:bg-crop-500 text-white font-medium text-xs shadow-lg shadow-crop-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Draw First Farm Boundary</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div
            key={farm.id}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-crop-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <Link
                    to={`/farms/${farm.id}`}
                    className="text-base font-bold text-white group-hover:text-crop-300 transition-colors hover:underline"
                  >
                    {farm.farm_name}
                  </Link>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {farm.district || ''}, {farm.state || ''} ({farm.latitude}°, {farm.longitude}°)
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    farm.drainage_class === 'POOR'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : farm.drainage_class === 'GOOD'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {farm.drainage_class || 'MODERATE'} DRAINAGE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-crop-400" /> Plot Area:
                  </span>
                  <span className="font-semibold text-white">
                    {farm.area_acres} Acres <span className="text-slate-400 font-normal">({farm.area_hectares} Ha)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-climate-400" /> Active Crop:
                  </span>
                  <span className="font-medium text-slate-200">Paddy (Flowering Stage)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                to={`/farms/${farm.id}`}
                className="text-xs font-semibold text-slate-300 hover:text-white"
              >
                View GIS Boundary
              </Link>
              <Link
                to="/rain-impact"
                className="text-xs font-medium text-crop-400 hover:text-crop-300 flex items-center gap-1"
              >
                <span>Assess Rain Risk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
