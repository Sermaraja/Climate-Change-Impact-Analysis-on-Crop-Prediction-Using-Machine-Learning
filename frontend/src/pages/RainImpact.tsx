import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, AlertTriangle, Activity, MapPin, Loader2, Info } from 'lucide-react';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../services/api';

interface RainAnalysisData {
  raw_sources: {
    source_provider: string;
    current_temperature: number;
    current_humidity: number;
    current_precipitation: number;
  };
  derived_metrics: {
    forecast_rain_1h: number;
    forecast_rain_3h: number;
    forecast_rain_6h: number;
    forecast_rain_12h: number;
    forecast_rain_24h: number;
    forecast_rain_48h: number;
    previous_rain_24h: number;
    previous_rain_48h: number;
    previous_rain_72h: number;
    maximum_hourly_rainfall: number;
    continuous_rain_hours: number;
    number_of_rain_hours: number;
    antecedent_rainfall_index: number;
  };
  application_rain_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  risk_classification_name: string;
  threshold_config: any;
}

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
  state?: string;
}

export const RainImpact: React.FC = () => {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

  const { data: farms = [] } = useQuery<FarmData[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const res = await apiClient.get<FarmData[]>('/farms');
      if (res.data.length > 0 && selectedFarmId === null) {
        setSelectedFarmId(res.data[0].id);
      }
      return res.data;
    },
  });

  const activeFarmId = selectedFarmId || (farms.length > 0 ? farms[0].id : null);

  const {
    data: rainAnalysis,
    isLoading,
    isError,
    error,
  } = useQuery<RainAnalysisData>({
    queryKey: ['rainAnalysis', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.get<RainAnalysisData>(`/farms/${activeFarmId}/rain-analysis`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  if (farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rainfall & Waterlogging Risk Analysis" subtitle="Derived feature-engineering for extreme rainfall classification" />
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <MapPin className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Registered Farms</h3>
          <p className="text-xs text-slate-400">Please register a farm to run real-time rainfall risk analytics.</p>
        </div>
      </div>
    );
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'EXTREME':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const metrics = rainAnalysis?.derived_metrics;

  const barChartData = metrics
    ? [
        { name: '1h', Rain: metrics.forecast_rain_1h },
        { name: '3h', Rain: metrics.forecast_rain_3h },
        { name: '6h', Rain: metrics.forecast_rain_6h },
        { name: '12h', Rain: metrics.forecast_rain_12h },
        { name: '24h', Rain: metrics.forecast_rain_24h },
        { name: '48h', Rain: metrics.forecast_rain_48h },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rainfall & Waterlogging Risk Engine"
        subtitle="Feature-engineered rainfall analytics derived from Open-Meteo satellite observations"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Farm:</span>
            <select
              value={activeFarmId || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farm_name} ({f.district || ''})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-crop-400 mb-2" />
          <p className="text-xs">Computing Derived Rainfall Features & Antecedent Wetness Index...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">Rainfall Analysis Computation Error</p>
            <p className="text-[11px] text-rose-200/80">{(error as any)?.response?.data?.detail || 'Failed to compute rainfall analytics.'}</p>
          </div>
        </div>
      )}

      {rainAnalysis && metrics && (
        <>
          {/* Rain Risk Classification Banner */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Application Rain Risk Assessment</h2>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Internal application classification based on forecast accumulation, continuous rain hours, and antecedent wetness index (ARI).
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getRiskBadge(rainAnalysis.application_rain_risk)}`}>
                {rainAnalysis.application_rain_risk} RISK LEVEL
              </span>
              <span className="text-[10px] text-slate-500 italic">Classification: {rainAnalysis.risk_classification_name}</span>
            </div>
          </div>

          {/* Derived Rainfall Features Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Next 24h Rain</span>
              <span className="text-xl font-bold text-cyan-300">{metrics.forecast_rain_24h} mm</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Next 48h Rain</span>
              <span className="text-xl font-bold text-blue-300">{metrics.forecast_rain_48h} mm</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Peak Hourly Rain</span>
              <span className="text-xl font-bold text-amber-300">{metrics.maximum_hourly_rainfall} mm/h</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Recent 72h Rain</span>
              <span className="text-xl font-bold text-purple-300">{metrics.previous_rain_72h} mm</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Continuous Duration</span>
              <span className="text-xl font-bold text-emerald-300">{metrics.continuous_rain_hours} Hours</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">Wetness Index (ARI)</span>
              <span className="text-xl font-bold text-rose-300">{metrics.antecedent_rainfall_index}</span>
            </div>
          </div>

          {/* Cumulative Forecast Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-crop-400" /> Cumulative Forecast Accumulation Timeline (mm)
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="mm" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="Rain" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classification Transparency Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Note:</strong> "Application Rain Risk" is an internal model wetness classification calculated from short-term precipitation forecasts and antecedent rainfall index (ARI). It is not an official government weather warning.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
