import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Thermometer, AlertCircle, Info, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
}

interface ClimateAnalysisResponse {
  period_analysed: string;
  data_source: string;
  methodology: string;
  trend_summary: {
    rainfall_trend_per_decade_mm: number;
    temperature_trend_per_decade_c: number;
    scientific_note: string;
  };
  annual_rainfall_trend: { year: number; rainfall_mm: number }[];
  temperature_avg_trend: { year: number; temp_avg_c: number }[];
  temperature_max_trend: { year: number; temp_max_c: number }[];
  heavy_rain_days_trend: { year: number; heavy_days: number }[];
  max_daily_rainfall_trend: { year: number; max_daily_mm: number }[];
  seasonal_breakdown: Record<string, number>;
  extreme_indicators: {
    r50mm_days_per_decade_avg: number;
    maximum_recorded_24h_rainfall_mm: number;
    return_period_100mm_event_years: number;
    climate_change_indicator: string;
  };
  scientific_limitations: string;
}

export const ClimateAnalysis: React.FC = () => {
  const { t, language } = useLanguage();
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

  const { data: climateData, isLoading } = useQuery<ClimateAnalysisResponse>({
    queryKey: ['climateAnalysis', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.get<ClimateAnalysisResponse>(`/farms/${activeFarmId}/climate-analysis`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('climate.title', '30-Year Climate Trends & Extreme Rainfall Reanalysis')}
        subtitle={
          language === 'ta'
            ? 'நீண்ட கால பத்தாண்டு வானிலை & காலநிலை மாற்ற போக்கு குறிகாட்டிகள்'
            : 'Long-term multi-decade weather & reanalysis climate change trend indicators'
        }
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{t('cropImpact.select_farm', 'Select Farm')}:</span>
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
          <p className="text-xs">
            {language === 'ta'
              ? '30 ஆண்டு காலநிலை போக்கு மற்றும் தீவிர மழை அதிர்வெண் கணக்கிடப்படுகிறது...'
              : 'Computing 30-Year Climate Trend Slopes & Extreme Rain Frequency...'}
          </p>
        </div>
      )}

      {climateData && (
        <div className="space-y-6 text-xs">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">
                {language === 'ta' ? 'பத்தாண்டுக்கான மழையளவு போக்கு' : 'Rainfall Trend / Decade'}
              </span>
              <span className="text-xl font-bold text-cyan-300">
                {climateData.trend_summary.rainfall_trend_per_decade_mm > 0 ? '+' : ''}
                {climateData.trend_summary.rainfall_trend_per_decade_mm} mm
              </span>
              <span className="text-[10px] text-slate-500 block">
                {language === 'ta' ? '30 ஆண்டு வருடாந்திர மாற்றம்' : '30-Year Annual Shift'}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">
                {language === 'ta' ? 'பத்தாண்டுக்கான வெப்பநிலை உயர்வு' : 'Temperature Warming / Decade'}
              </span>
              <span className="text-xl font-bold text-amber-300">
                +{climateData.trend_summary.temperature_trend_per_decade_c}°C
              </span>
              <span className="text-[10px] text-slate-500 block">
                {language === 'ta' ? 'சராசரி வெப்பமயமாதல்' : 'Mean Thermal Warming'}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">
                {language === 'ta' ? 'கனமழை நாட்கள் (>50mm)' : 'Heavy Rain Days (>50mm)'}
              </span>
              <span className="text-xl font-bold text-purple-300">
                {climateData.extreme_indicators.r50mm_days_per_decade_avg} {language === 'ta' ? 'நாட்கள் / பத்தாண்டு' : 'Days / Decade'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {language === 'ta' ? 'தீவிர நிகழ்வு அதிர்வெண்' : 'Extreme Event Frequency'}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">
                {language === 'ta' ? 'அதிகபட்ச 24 மணி நேர தீவிர மழை' : 'Max 24h Extreme Daily Rain'}
              </span>
              <span className="text-xl font-bold text-rose-300">
                {climateData.extreme_indicators.maximum_recorded_24h_rainfall_mm} mm
              </span>
              <span className="text-[10px] text-slate-500 block">
                {language === 'ta' ? 'வரலாற்று 30 ஆண்டு உச்சம்' : 'Historical 30y Maximum'}
              </span>
            </div>
          </div>

          {/* Annual Rainfall Trend Line Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />{' '}
              {language === 'ta' ? '30 ஆண்டு வருடாந்திர மழையளவு போக்கு (1995 - 2025)' : '30-Year Annual Precipitation Trend (1995 - 2025)'}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={climateData.annual_rainfall_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="mm" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="rainfall_mm" stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Trend Line Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />{' '}
              {language === 'ta' ? '30 ஆண்டு வெப்பநிலை போக்கு (°C)' : '30-Year Temperature Trends (°C)'}
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={climateData.temperature_avg_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[25, 38]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="temp_avg_c" stroke="#f59e0b" name="Mean Temp °C" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heavy Rain Days Bar Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400" />{' '}
              {language === 'ta' ? 'வருடாந்திர கனமழை நாட்களின் எண்ணிக்கை (>50mm/நாள்)' : 'Annual Frequency of Heavy Rain Days (>50mm/day)'}
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={climateData.heavy_rain_days_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="heavy_days" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Source & Limitations Metadata Footer */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-slate-400">
            <div className="flex items-center gap-2 text-white font-bold">
              <Info className="w-4 h-4 text-amber-400" />{' '}
              {language === 'ta' ? 'காலநிலை மெட்டாடேட்டா & அறிவியல் முறை' : 'Climate Metadata & Scientific Methodology'}
            </div>
            <p>
              <strong>{language === 'ta' ? 'பகுப்பாய்வு காலம்:' : 'Period Analysed:'}</strong> {climateData.period_analysed}
            </p>
            <p>
              <strong>{language === 'ta' ? 'தரவு ஆதாரம்:' : 'Data Source:'}</strong> {climateData.data_source}
            </p>
            <p>
              <strong>{language === 'ta' ? 'முறை:' : 'Methodology:'}</strong> {climateData.methodology}
            </p>
            <p className="text-amber-300/80 text-[11px]">
              <strong>{language === 'ta' ? 'அறிவியல் குறிப்பு:' : 'Scientific Note:'}</strong> {climateData.trend_summary.scientific_note}
            </p>
            <p className="text-slate-500 text-[11px]">
              <strong>{language === 'ta' ? 'வரம்புகள்:' : 'Limitations:'}</strong> {climateData.scientific_limitations}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
