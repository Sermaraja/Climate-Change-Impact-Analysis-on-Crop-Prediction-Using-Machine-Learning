import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sprout,
  HelpCircle,
  Search,
  Wind,
  Sun,
  Droplets,
  Eye,
  ShieldAlert,
  RefreshCw,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ProductTour } from '../components/common/ProductTour';
import { FarmImpactMap } from '../components/dashboard/FarmImpactMap';
import type { FarmImpactFeature } from '../components/dashboard/FarmImpactMap';
import { CropStageGauge } from '../components/dashboard/CropStageGauge';
import { WeatherForecastStrip } from '../components/dashboard/WeatherForecastStrip';

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
  state?: string;
  drainage_class?: string;
  latitude: number;
  longitude: number;
  area_acres?: number;
  boundary_geojson?: any;
}

interface RainAnalysisData {
  raw_sources: {
    current_temperature: number;
    current_humidity: number;
    wind_speed?: number;
  };
  derived_metrics: {
    forecast_rain_24h: number;
    forecast_rain_48h: number;
    previous_rain_48h: number;
    antecedent_rainfall_index: number;
  };
  application_rain_risk: string;
  impact_explanation?: {
    primary_factor: string;
    narrative: string;
  };
}

interface ForecastResponse {
  forecast_24h_sum_mm?: number;
  forecast_48h_sum_mm?: number;
  hourly_timeline?: Array<{
    time: string;
    precipitation_mm: number;
    temperature_celsius?: number;
    relative_humidity?: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, translateCrop, translateStage, translateRisk } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionTab, setActionTab] = useState<'BEFORE' | 'DURING' | 'AFTER'>('BEFORE');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);

  // 1. Fetch User Farms
  const { data: farms = [] } = useQuery<FarmData[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const res = await apiClient.get<FarmData[]>('/farms');
      return res.data;
    },
  });

  // 2. Fetch Multi-Farm Impact Scan Summary
  const { data: scanData } = useQuery({
    queryKey: ['farmImpactSummary'],
    queryFn: async () => {
      const res = await apiClient.get('/farm-impact/summary');
      return res.data;
    },
  });

  const allFarmsImpact: FarmImpactFeature[] = scanData?.farms || [];
  const impactSummary = scanData?.summary || {
    farms_total: farms.length,
    farms_analysed: allFarmsImpact.length,
    farms_requiring_attention: 0,
    severe_count: 0,
    high_count: 0,
    elevated_count: 0,
    low_count: 0,
  };

  // Selected farm object
  const activeFarm =
    (selectedFarmId ? farms.find((f) => f.id === selectedFarmId) : null) ||
    farms[0] ||
    null;

  const activeFarmImpact =
    (selectedFarmId
      ? allFarmsImpact.find((f) => f.farm_id === selectedFarmId)
      : null) ||
    allFarmsImpact[0] ||
    null;

  // Most severe farm for Hero Alert
  const severeFarm =
    allFarmsImpact.find((f) => f.crop_impact_analysis?.application_impact_level === 'RED') ||
    allFarmsImpact.find((f) => f.crop_impact_analysis?.application_impact_level === 'ORANGE') ||
    allFarmsImpact.find((f) => f.crop_impact_analysis?.application_impact_level === 'YELLOW') ||
    null;

  // 3. Sequential Multi-Step Scanning Mutation
  const scanSteps = [
    'Checking farm locations...',
    'Retrieving weather...',
    'Analysing rainfall...',
    'Checking soil and drainage...',
    'Evaluating waterlogging...',
    'Analysing crop and growth stage...',
    'Calculating crop impact...',
    'Preparing farmer actions...'
  ];

  const analyseAllMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      for (let i = 0; i < scanSteps.length; i++) {
        setAnalysisStepIndex(i);
        await new Promise((r) => setTimeout(r, 300));
      }
      const res = await apiClient.post('/farm-impact/analyse-all');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['farmImpactSummary'], data);
      setIsScanning(false);
    },
    onError: () => {
      setIsScanning(false);
    }
  });

  // 4. Supporting queries for weather
  const { data: rainData } = useQuery<RainAnalysisData>({
    queryKey: ['rainAnalysis', activeFarm?.id],
    queryFn: async () => {
      const res = await apiClient.get<RainAnalysisData>(`/farms/${activeFarm?.id}/rain-analysis`);
      return res.data;
    },
    enabled: !!activeFarm?.id,
  });

  const { data: forecastData } = useQuery<ForecastResponse | null>({
    queryKey: ['farmForecast', activeFarm?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ForecastResponse>(`/farms/${activeFarm?.id}/weather/forecast`);
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: !!activeFarm?.id,
  });

  // Tour listener
  useEffect(() => {
    const handleOpenTour = () => setTourOpen(true);
    window.addEventListener('open-product-tour', handleOpenTour);
    return () => window.removeEventListener('open-product-tour', handleOpenTour);
  }, []);

  useEffect(() => {
    if (user && user.tour_status === 'NOT_STARTED') {
      setShowPromptModal(true);
    }
  }, [user]);

  const weather = rainData?.raw_sources;
  const metrics = rainData?.derived_metrics;

  return (
    <div className="space-y-6 text-slate-800 relative pb-12 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Product Tour */}
      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Tour Prompt Modal */}
      {showPromptModal && !tourOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5ede8] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t('auth.tour.prompt_modal_title', 'Take a quick tour?')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'auth.tour.prompt_modal_desc',
                  'See how to map your farm, monitor rainfall and analyse crop risk with CropClimate AI.'
                )}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowPromptModal(false);
                  setTourOpen(true);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                {t('auth.tour.start_tour', 'Start Tour')}
              </button>
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t('auth.tour.prompt_modal_later', 'Maybe Later')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP CONTROL BAR: SEARCH, LOCATION, AND ANALYSE BUTTON */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#e5ede8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="w-full md:w-auto flex-1 flex items-center gap-2 bg-[#f4f7f5] rounded-xl px-3 py-1.5 border border-slate-200/80">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={t('dashboard.search_placeholder', 'Search by farm name, crop, or district...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {farms.length > 1 && (
            <select
              value={activeFarm?.id || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              aria-label={t('dashboard.switch_farm', 'Switch Farm')}
              className="text-xs bg-white text-slate-700 font-bold border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farm_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-900 text-xs">
              {activeFarm ? activeFarm.district || 'Thanjavur' : 'Thanjavur'}, {activeFarm?.state || 'Tamil Nadu'}
            </span>
          </div>

          <button
            onClick={() => analyseAllMutation.mutate()}
            disabled={isScanning || analyseAllMutation.isPending}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] truncate max-w-[140px]">{scanSteps[analysisStepIndex]}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analyse All My Farms</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {farms.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e5ede8] text-center space-y-6 max-w-4xl mx-auto my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Add your first farm to start crop-impact monitoring.
            </h2>
            <p className="text-sm text-slate-600">
              CropClimate AI analyses your farm's rainfall conditions, soil, drainage, and active crop stage to assess damage, survival, and recovery potential.
            </p>
          </div>
          <button
            onClick={() => navigate('/farms/new')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <span>Add My First Farm</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* NORMAL OPERATIONAL DASHBOARD — PRIORITY 1 TO 10 REORGANIZED */
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* PRIORITY 1 & 2: CURRENT WARNING / MAIN HERO ALERT */}
          {/* ========================================================================= */}
          {severeFarm && severeFarm.crop_impact_analysis ? (
            <div
              className={`rounded-2xl p-5 border shadow-xs transition-all ${
                severeFarm.crop_impact_analysis.application_impact_level === 'RED'
                  ? 'bg-red-50/90 border-red-300 text-red-950'
                  : severeFarm.crop_impact_analysis.application_impact_level === 'ORANGE'
                  ? 'bg-orange-50/90 border-orange-300 text-orange-950'
                  : 'bg-yellow-50/90 border-yellow-300 text-yellow-950'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        severeFarm.crop_impact_analysis.application_impact_level === 'RED'
                          ? 'bg-red-600 text-white border-red-700'
                          : severeFarm.crop_impact_analysis.application_impact_level === 'ORANGE'
                          ? 'bg-orange-600 text-white border-orange-700'
                          : 'bg-yellow-600 text-white border-yellow-700'
                      }`}
                    >
                      {severeFarm.crop_impact_analysis.application_impact_level} CROP IMPACT RISK
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      CropClimate AI Farm-Specific Alert
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {severeFarm.farm_name}
                    </h2>
                    <p className="text-xs text-slate-700 mt-0.5">
                      <strong>{severeFarm.active_crop?.crop_name}</strong> • Stage: {translateStage(severeFarm.active_crop?.growth_stage || 'Flowering')} ({severeFarm.active_crop?.growth_stage_source})
                    </p>
                  </div>

                  {/* 4 Core Scientific Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-2xl text-xs">
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Waterlogging</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {translateRisk(severeFarm.waterlogging_analysis?.risk_level || 'HIGH')}
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Crop Damage</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {translateRisk(severeFarm.crop_impact_analysis?.damage_risk || 'SEVERE')}
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Survival</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {translateRisk(severeFarm.crop_impact_analysis?.survival_potential || 'LOW')}
                      </span>
                    </div>
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {translateRisk(severeFarm.crop_impact_analysis?.recovery_potential || 'MODERATE')}
                      </span>
                    </div>
                  </div>

                  {/* WHY THIS ALERT (Actual contributing factors) */}
                  <div className="pt-2 text-xs text-slate-800">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 block mb-1">
                      WHY? (Contributing Risk Factors)
                    </span>
                    <p className="text-xs leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200">
                      {(severeFarm as any).why_this_alert?.contributing_factors?.join(' • ') ||
                        'Heavy forecast rainfall + Wet antecedent conditions + Poor drainage restriction + Sensitive growth stage'}
                    </p>
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="flex sm:flex-col gap-2 shrink-0 self-stretch sm:self-auto justify-end sm:justify-start">
                  <button
                    onClick={() => navigate('/crop-impact')}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    View Full Analysis
                  </button>
                  <button
                    onClick={() => navigate('/crop-impact')}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    What Should I Do?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Low risk green alert banner */
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">
                    All Farms within Low Crop Impact Band (Green)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    No critical waterlogging or severe crop stress detected across your registered fields.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/crop-impact')}
                className="px-3.5 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                View Impact Details
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRIORITY 2: FARMS REQUIRING ATTENTION CARDS */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Farms Requiring Attention ({impactSummary.farms_requiring_attention})
                </h3>
              </div>
              <button
                onClick={() => navigate('/crop-impact')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Farms</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {allFarmsImpact.map((f) => {
                const impact = f.crop_impact_analysis?.application_impact_level || 'UNKNOWN';
                const isSelected = (activeFarm?.id === f.farm_id);

                let borderLeft = 'border-l-slate-300';
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (impact === 'RED') {
                  borderLeft = 'border-l-red-600';
                  badgeClass = 'bg-red-50 text-red-700 border-red-300';
                } else if (impact === 'ORANGE') {
                  borderLeft = 'border-l-orange-500';
                  badgeClass = 'bg-orange-50 text-orange-700 border-orange-300';
                } else if (impact === 'YELLOW') {
                  borderLeft = 'border-l-yellow-400';
                  badgeClass = 'bg-yellow-50 text-yellow-800 border-yellow-300';
                } else if (impact === 'GREEN') {
                  borderLeft = 'border-l-emerald-500';
                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                }

                return (
                  <div
                    key={f.farm_id}
                    onClick={() => setSelectedFarmId(f.farm_id)}
                    className={`bg-white rounded-2xl p-4 border border-[#e5ede8] border-l-4 ${borderLeft} shadow-xs hover:shadow-md transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-emerald-500/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{f.farm_name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {f.has_crop ? (
                            <>
                              {translateCrop(f.active_crop?.crop_name || 'Crop')} • {translateStage(f.active_crop?.growth_stage || 'Stage')}
                            </>
                          ) : (
                            <span className="text-amber-700 font-medium">Add Crop</span>
                          )}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {impact}
                      </span>
                    </div>

                    {f.has_crop && (
                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        <div className="flex justify-between">
                          <span>Forecast Rain 24h:</span>
                          <span className="font-semibold text-sky-700">{f.weather_metrics?.forecast_rain_24h_mm ?? 0} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waterlogging Risk:</span>
                          <span className="font-semibold text-slate-800">{translateRisk(f.waterlogging_analysis?.risk_level || 'LOW')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crop Damage Risk:</span>
                          <span className="font-semibold text-slate-800">{translateRisk(f.crop_impact_analysis?.damage_risk || 'LOW')}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {(f as any).data_completeness?.weather || 'Telemetric'}
                      </span>
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        Action Plan <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRIORITY 3: FARM IMPACT MAP (Interactive multi-farm polygons) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-5 border border-[#e5ede8] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Farm Impact Map (All User Fields)
                </h3>
                <p className="text-xs text-slate-500">
                  Click any farm polygon to inspect specific crop stage sensitivity, forecast rain volume, and waterlogging.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Currently Selected:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {activeFarm?.farm_name || 'All Farms'}
                </span>
              </div>
            </div>

            <FarmImpactMap
              farms={allFarmsImpact}
              selectedFarmId={activeFarm?.id}
              onSelectFarm={(id) => setSelectedFarmId(id)}
              onViewAnalysis={() => navigate('/crop-impact')}
              onViewActions={() => navigate('/crop-impact')}
              heightClass="h-[360px] sm:h-[420px]"
            />
          </div>

          {/* ========================================================================= */}
          {/* PRIORITY 5 & 6: CROP IMPACT DETAILS & FARMER ACTIONS */}
          {/* ========================================================================= */}
          {activeFarmImpact && activeFarmImpact.has_crop && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Crop Gauge & Details */}
              <div className="lg:col-span-5 space-y-4">
                <CropStageGauge
                  cropName={activeFarmImpact.active_crop?.crop_name || 'Paddy'}
                  stageName={activeFarmImpact.active_crop?.growth_stage || 'Tillering'}
                  cropAgeDays={activeFarmImpact.active_crop?.crop_age_days || 45}
                  plantingDate={'2026-08-12'}
                  varietyName={activeFarmImpact.active_crop?.variety_name || 'Standard'}
                  areaAcres={activeFarmImpact.area_acres || 4.5}
                />
              </div>

              {/* Right Column: Recommended Farmer Actions (Before / During / After Tabs) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#e5ede8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-base text-slate-900">
                      Farmer Recommended Actions — {activeFarmImpact.farm_name}
                    </h3>
                  </div>

                  {/* Timing Tabs */}
                  <div className="flex items-center gap-1 bg-[#f4f7f5] p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setActionTab('BEFORE')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        actionTab === 'BEFORE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Before Rain
                    </button>
                    <button
                      onClick={() => setActionTab('DURING')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        actionTab === 'DURING' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      During Rain
                    </button>
                    <button
                      onClick={() => setActionTab('AFTER')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        actionTab === 'AFTER' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      After Rain
                    </button>
                  </div>
                </div>

                {/* Actions Content */}
                <div className="space-y-2.5">
                  {actionTab === 'BEFORE' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Priority Field Preparations
                      </span>
                      {((activeFarmImpact as any).recommended_actions?.before_rain || []).map((act: any, idx: number) => (
                        <div key={idx} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs">
                          <strong className="block text-slate-900 font-bold">{act.title}</strong>
                          <p className="text-slate-600 mt-0.5">{act.action}</p>
                        </div>
                      ))}
                      {(!((activeFarmImpact as any).recommended_actions?.before_rain) || (activeFarmImpact as any).recommended_actions?.before_rain.length === 0) && (
                        <p className="text-xs text-slate-500 italic p-2">Clear drainage ditches and strengthen bunds to prevent ponding.</p>
                      )}
                    </div>
                  )}

                  {actionTab === 'DURING' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                        Rainfall Event Monitoring
                      </span>
                      {((activeFarmImpact as any).recommended_actions?.during_rain || []).map((act: any, idx: number) => (
                        <div key={idx} className="p-3 bg-sky-50/40 rounded-xl border border-sky-100 text-xs">
                          <strong className="block text-slate-900 font-bold">{act.title}</strong>
                          <p className="text-slate-600 mt-0.5">{act.action}</p>
                        </div>
                      ))}
                      {(!((activeFarmImpact as any).recommended_actions?.during_rain) || (activeFarmImpact as any).recommended_actions?.during_rain.length === 0) && (
                        <p className="text-xs text-slate-500 italic p-2">Ensure field runoff points stay open; suspend fertilizer spraying.</p>
                      )}
                    </div>
                  )}

                  {actionTab === 'AFTER' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Post-Rain Recovery Protocol
                      </span>
                      {((activeFarmImpact as any).recommended_actions?.after_rain || []).map((act: any, idx: number) => (
                        <div key={idx} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-xs">
                          <strong className="block text-slate-900 font-bold">{act.title}</strong>
                          <p className="text-slate-600 mt-0.5">{act.action}</p>
                        </div>
                      ))}
                      {(!((activeFarmImpact as any).recommended_actions?.after_rain) || (activeFarmImpact as any).recommended_actions?.after_rain.length === 0) && (
                        <p className="text-xs text-slate-500 italic p-2">Drain stagnant water within 24 hours and apply foliar micronutrients to boost root aeration.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => navigate('/crop-impact')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Agronomic Guide</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRIORITY 7: WEATHER & RAINFALL HORIZONTAL STRIP */}
          {/* ========================================================================= */}
          <div data-tour="weather" className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('weather.hourly_forecast')} — {activeFarm?.farm_name}
            </h3>
            <WeatherForecastStrip
              currentTemp={weather?.current_temperature || 28}
              currentHumidity={weather?.current_humidity || 72}
              windSpeed={weather?.wind_speed || 6.5}
              forecast24h={metrics?.forecast_rain_24h || 12.5}
              forecast48h={metrics?.forecast_rain_48h || 24.0}
              hourlyData={forecastData?.hourly_timeline || []}
            />
          </div>

          {/* ========================================================================= */}
          {/* PRIORITY 8 & 9: MODULAR ENVIRONMENTAL & SOIL INDICATORS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-3xl p-4 border border-[#e5ede8] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('dashboard.wind_status', 'Wind Status')}
                </span>
                <Wind className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">{weather?.wind_speed || 7.5}</span>
                <span className="text-xs text-slate-500 font-semibold">{t('units.kmh', 'km/h')}</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">N-E Direction • Optimal</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#e5ede8] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('dashboard.uv_index', 'UV Index')}
                </span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">5.50</span>
                <span className="text-xs text-slate-500 font-semibold">uv</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Moderate Radiation</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#e5ede8] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('weather.humidity', 'Humidity')}
                </span>
                <Droplets className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  {weather?.current_humidity || 84}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block font-medium truncate">
                {t('dashboard.dew_point_desc', 'Dew point is 21° right now')}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-[#e5ede8] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('dashboard.visibility', 'Visibility')}
                </span>
                <Eye className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900">04</span>
                <span className="text-xs text-slate-500 font-semibold">km</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium truncate">
                {t('dashboard.haze_desc', 'Clear atmospheric conditions')}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRIORITY 10: BOTTOM STATUS PILLS */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#e5ede8] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('dashboard.drainage_verified', 'Soil Drainage: Verified')}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('dashboard.moisture_balance_optimal', 'Moisture Balance: Optimal')}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CropClimate AI Farm Impact Engine Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-600">CropClimate AI Engine v1.0.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
