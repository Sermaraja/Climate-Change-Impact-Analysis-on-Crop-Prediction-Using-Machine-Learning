import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Thermometer, Droplets, Wind, AlertCircle, Loader2, Sparkles, MapPin } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../services/api';

interface CurrentWeatherData {
  time: string;
  temperature_2m: number;
  temperature_unit: string;
  relative_humidity_2m: number;
  humidity_unit: string;
  precipitation: number;
  rain: number;
  precipitation_unit: string;
  wind_speed_10m: number;
  wind_speed_unit: string;
  source: string;
}

interface ForecastWeatherData {
  forecast_rain_24h_mm: number;
  forecast_rain_48h_mm: number;
  hourly_timeline: Array<{
    time: string;
    precipitation_mm: number;
    probability_pct: number;
    temperature_c: number;
    humidity_pct: number;
  }>;
  source: string;
}

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
  state?: string;
}

export const Weather: React.FC = () => {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

  // Fetch Farms
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

  // Fetch Current Weather
  const {
    data: current,
    isLoading: isLoadingCurrent,
    isError: isErrorCurrent,
    error: errorCurrent,
  } = useQuery<CurrentWeatherData>({
    queryKey: ['weatherCurrent', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.get<CurrentWeatherData>(`/farms/${activeFarmId}/weather/current`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  // Fetch Weather Forecast
  const {
    data: forecast,
    isLoading: isLoadingForecast,
    isError: isErrorForecast,
  } = useQuery<ForecastWeatherData>({
    queryKey: ['weatherForecast', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.get<ForecastWeatherData>(`/farms/${activeFarmId}/weather/forecast`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  if (farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Farm Weather Forecast" subtitle="Real-time Open-Meteo satellite & meteorological telemetry" />
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <MapPin className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Farms Registered</h3>
          <p className="text-xs text-slate-400">Please register a farm boundary first to view hyper-local weather telemetry.</p>
        </div>
      </div>
    );
  }

  const chartData = forecast?.hourly_timeline.map((h) => ({
    time: h.time.split('T')[1]?.substring(0, 5) || h.time,
    Precipitation: h.precipitation_mm,
    Probability: h.probability_pct,
    Temperature: h.temperature_c,
  })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Farm Weather Forecast"
        subtitle="Real-time satellite & meteorological telemetry powered by Open-Meteo"
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

      {/* Weather Source Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-slate-300 font-semibold">Weather Data Source:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
            Open-Meteo API
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Updated: {current?.time || 'Just now'}</span>
      </div>

      {/* Error state if Open-Meteo fails */}
      {(isErrorCurrent || isErrorForecast) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">Weather Data Request Failed</p>
            <p className="text-[11px] text-rose-200/80">
              {(errorCurrent as any)?.response?.data?.detail || 'Open-Meteo service unreachable. No fake values generated.'}
            </p>
          </div>
        </div>
      )}

      {/* Current Telemetry Metrics Grid */}
      {(isLoadingCurrent || isLoadingForecast) ? (
        <div className="min-h-[30vh] flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-crop-400 mr-2" /> Fetching Open-Meteo Satellite Data...
        </div>
      ) : (
        current && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Current Temp</span>
                <Thermometer className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {current.temperature_2m} <span className="text-sm font-normal text-slate-400">{current.temperature_unit}</span>
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Relative Humidity</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {current.relative_humidity_2m} <span className="text-sm font-normal text-slate-400">{current.humidity_unit}</span>
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Current Precipitation</span>
                <CloudRain className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {current.precipitation} <span className="text-sm font-normal text-slate-400">{current.precipitation_unit}</span>
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Wind Speed</span>
                <Wind className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {current.wind_speed_10m} <span className="text-sm font-normal text-slate-400">{current.wind_speed_unit}</span>
              </p>
            </div>
          </div>
        )
      )}

      {/* Forecast Summaries Card */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">24-Hour Forecast Rain</span>
              <span className="text-xl font-bold text-white">{forecast.forecast_rain_24h_mm} mm</span>
            </div>
            <CloudRain className="w-8 h-8 text-blue-400/40" />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">48-Hour Forecast Rain</span>
              <span className="text-xl font-bold text-white">{forecast.forecast_rain_48h_mm} mm</span>
            </div>
            <CloudRain className="w-8 h-8 text-cyan-400/40" />
          </div>
        </div>
      )}

      {/* Hourly Rainfall Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" /> 48-Hour Hourly Precipitation Timeline (mm)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="mm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Precipitation" stroke="#38bdf8" fillOpacity={1} fill="url(#rainGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
