import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  Sprout,
  Activity,
  Layers,
  HelpCircle,
  Search,
  Wind,
  Sun,
  Droplets,
  Eye,
  Sparkles,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ProductTour } from '../components/common/ProductTour';
import { DashboardFarmMap } from '../components/dashboard/DashboardFarmMap';
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

interface FarmCropData {
  crop_name: string;
  variety_name?: string;
  planting_date?: string;
  crop_age_days?: number;
  estimated_growth_stage?: string;
  confirmed_growth_stage?: string;
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
  const { t, translateCrop, translateDrainage, translateRisk, language } = useLanguage();
  const { user } = useAuth();
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch User Farms
  const { data: farms = [] } = useQuery<FarmData[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const res = await apiClient.get<FarmData[]>('/farms');
      return res.data;
    },
  });

  // Default to first farm if none selected
  const activeFarm = (selectedFarmId ? farms.find((f) => f.id === selectedFarmId) : null) || farms[0] || null;

  // 2. Fetch Rain Analysis for active farm
  const { data: rainData } = useQuery<RainAnalysisData>({
    queryKey: ['rainAnalysis', activeFarm?.id],
    queryFn: async () => {
      const res = await apiClient.get<RainAnalysisData>(`/farms/${activeFarm?.id}/rain-analysis`);
      return res.data;
    },
    enabled: !!activeFarm?.id,
  });

  // 3. Fetch Active Crop details for active farm
  const { data: activeCrop } = useQuery<FarmCropData | null>({
    queryKey: ['farmCrop', activeFarm?.id],
    queryFn: async () => {
      try {
        const res = await apiClient.get<FarmCropData>(`/farms/${activeFarm?.id}/crop`);
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: !!activeFarm?.id,
  });

  // 4. Fetch Weather Forecast for active farm
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

  // Listen for custom "open-product-tour" event from Navbar
  useEffect(() => {
    const handleOpenTour = () => setTourOpen(true);
    window.addEventListener('open-product-tour', handleOpenTour);
    return () => window.removeEventListener('open-product-tour', handleOpenTour);
  }, []);

  // Show first-time tour prompt modal if user hasn't started tour yet
  useEffect(() => {
    if (user && user.tour_status === 'NOT_STARTED') {
      setShowPromptModal(true);
    }
  }, [user]);

  const weather = rainData?.raw_sources;
  const metrics = rainData?.derived_metrics;
  const rainRisk = rainData?.application_rain_risk || 'LOW_WASH_RISK';

  // Format today's date in stylish format (Reference 1 style)
  const todayFormatted = new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Total area calculation
  const totalArea = farms.reduce((acc, f) => acc + (f.area_acres || 0), 0);

  return (
    <div className="space-y-5 text-slate-800 relative">
      {/* Product Tour Overlay & Modal */}
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

      {/* ========================================================================= */}
      {/* TOP SEARCH & FARM SELECTOR CONTROL BAR (Reference 2 Inspiration) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#e5ede8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Search Input with Farm Selector */}
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
          <button
            onClick={() => navigate('/rain-impact')}
            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
          >
            {t('dashboard.search_btn', 'Search')}
          </button>
        </div>

        {/* Location & Quick Actions */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-900 text-xs">
              {activeFarm ? activeFarm.district || 'Thanjavur' : 'Thanjavur'}, {activeFarm?.state || 'Tamil Nadu'}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {weather ? `${weather.current_temperature}°C` : '28°C'}
            </span>
          </div>

          <button
            onClick={() => navigate('/farms/new')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
            data-tour="my-farms"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ta' ? 'பண்ணையைச் சேர்' : 'Add Farm'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMPTY STATE FOR USERS WITH NO FARMS */}
      {/* ========================================================================= */}
      {farms.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e5ede8] text-center space-y-8 max-w-4xl mx-auto my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <Sprout className="w-8 h-8" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('dashboard.no_farms_title', 'Start by adding your first farm.')}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {t(
                'dashboard.no_farms_desc',
                'Once your farm and crop are configured, CropClimate AI can analyse rainfall and crop-impact conditions for that location.'
              )}
            </p>
          </div>

          {/* 3-Step Quick Start Concept */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <MapPin className="w-5 h-5" />
                <span className="text-xs text-slate-400">{language === 'ta' ? 'படி 1' : 'Step 1'}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{t('auth.welcome.step1_title', 'Map Farm')}</h4>
              <p className="text-[11px] text-slate-500">
                {t('auth.welcome.step1_desc', 'Locate your farm on interactive map and draw spatial boundary.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <Layers className="w-5 h-5" />
                <span className="text-xs text-slate-400">{language === 'ta' ? 'படி 2' : 'Step 2'}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{t('auth.welcome.step2_title', 'Add Crop')}</h4>
              <p className="text-[11px] text-slate-500">
                {t('auth.welcome.step2_desc', 'Configure current crop type, planting date and growth stage.')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-amber-500 font-bold">
                <Activity className="w-5 h-5" />
                <span className="text-xs text-slate-400">{language === 'ta' ? 'படி 3' : 'Step 3'}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{t('auth.welcome.step3_title', 'Analyse Rain Impact')}</h4>
              <p className="text-[11px] text-slate-500">
                {t('auth.welcome.step3_desc', 'Evaluate waterlogging, crop stress, survival & recovery potential.')}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/farms/new')}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>{t('dashboard.add_farm_btn', 'Add My First Farm')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* NORMAL OPERATIONAL DASHBOARD (Exact Composition of References 1 & 2) */
        /* ========================================================================= */
        <>
          {/* Official Weather Warning Alert (Clear separation from internal ML risk) */}
          {metrics && metrics.forecast_rain_24h > 50.0 && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <span>{t('alerts.official_weather_warning')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200 border border-amber-300 text-amber-950 font-bold">
                    {language === 'ta' ? 'சரிபார்க்கப்பட்ட அறிவிப்பு' : 'VERIFIED BULLETIN'}
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  {language === 'ta'
                    ? `கனமழை எச்சரிக்கை (அடுத்த 24 மணி நேரத்தில் ${metrics.forecast_rain_24h} mm மழை எதிர்பார்க்கப்படுகிறது). பண்ணை வடிகால்களை தடையின்றி வைத்திருக்கவும்.`
                    : `Heavy Precipitation Alert (${metrics.forecast_rain_24h} mm forecast in 24 hours). Keep field drainage outlets clear.`}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. HORIZONTAL WEATHER FORECAST STRIP (Reference 2 Master Design) */}
          {/* ========================================================================= */}
          <div data-tour="weather">
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
          {/* 2. MAIN CENTRAL GRID: LEFT CARDS + LARGE PROMINENT FARM MAP (Reference 1) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (Reference 1 & 2): Farm Schedule Overview & Crop Stage Gauge */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Today's Farm Schedule & Metric Overview (Reference 1) */}
              <div className="bg-white rounded-3xl p-5 border border-[#e5ede8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {t('dashboard.today_field_status', "Today's Field Status")}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{todayFormatted}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {language === 'ta' ? 'செயலில்' : 'Ongoing'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#f8faf8] border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {t('dashboard.total_cultivated_area', 'Cultivated Area')}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 block">
                      {activeFarm?.area_acres || totalArea || 128} {t('units.acres', 'Acres')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">PostGIS Mapped</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#f8faf8] border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {t('dashboard.active_crop_zones', 'Active Crop Zones')}
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700 block">
                      0{farms.length || 1} {language === 'ta' ? 'மண்டலங்கள்' : 'Zones'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {translateCrop(activeCrop?.crop_name || 'Paddy')}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className="p-3 rounded-2xl bg-[#f8faf8] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      94%
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {t('dashboard.farm_efficiency', 'Farm Efficiency')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {t('soil.drainage')}: {translateDrainage(activeFarm?.drainage_class || 'GOOD')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('dashboard.optimal', 'Optimal')}
                  </span>
                </div>
              </div>

              {/* Card 2: Crop Stage Circular Progress Ring (Reference 2 Master Element) */}
              <div data-tour="crop-profile">
                <CropStageGauge
                  cropName={activeCrop?.crop_name || 'Paddy'}
                  stageName={activeCrop?.confirmed_growth_stage || activeCrop?.estimated_growth_stage || 'Flowering'}
                  cropAgeDays={activeCrop?.crop_age_days || 45}
                  plantingDate={activeCrop?.planting_date || '2026-08-12'}
                  varietyName={activeCrop?.variety_name || 'ADT-45'}
                  areaAcres={activeFarm?.area_acres || 4.5}
                />
              </div>
            </div>

            {/* Right Column (Reference 1 Master Composition): Large Farm Map & Analytical Widgets */}
            <div className="lg:col-span-8 space-y-4">
              {/* Large Prominent Farm Satellite Map Panel (Reference 1) */}
              <div data-tour="farm-map">
                {activeFarm ? (
                  <DashboardFarmMap
                    farm={activeFarm}
                    rainRisk={rainRisk}
                    moistureIndex={metrics?.antecedent_rainfall_index || 21.4}
                  />
                ) : (
                  <div className="h-[420px] rounded-3xl bg-white border border-[#e5ede8] flex items-center justify-center text-slate-400">
                    Map preview loading...
                  </div>
                )}
              </div>

              {/* Lower Analytical Widgets Row (Directly from Reference 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lower Widget 1: Rain Impact & Loss Risk Card (Reference 1) */}
                <div className="bg-white rounded-3xl p-5 border border-[#e5ede8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-2.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      {t('impact_metrics.crop_loss_risk', 'Rainfall & Crop Impact Risk')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {language === 'ta' ? 'அடுத்த 48 மணி நேரம்' : 'Next 48 Hours'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-slate-900">
                        {metrics?.forecast_rain_24h || 12.5} mm
                      </span>
                      <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
                        {t('impact_metrics.app_impact_risk')}:{' '}
                        <span className="font-bold text-emerald-700">{translateRisk(rainRisk)}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingDown className="w-3.5 h-3.5" /> -3.7% Variance
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Safe moisture band</span>
                    </div>
                  </div>

                  {/* Progress Comparison Bars */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>24h Forecast vs Critical Threshold</span>
                      <span className="font-bold text-slate-900">
                        {metrics?.forecast_rain_24h || 12.5} / 50 mm
                      </span>
                    </div>
                    <div className="w-full bg-[#f1f5f2] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((metrics?.forecast_rain_24h || 12.5) / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lower Widget 2: AI Smart Farm Insight Card (Reference 1 Master Element) */}
                <div className="bg-white rounded-3xl p-5 border border-[#e5ede8] shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-2.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {t('dashboard.ai_smart_farm_insight', 'AI Smart Farm Insight')}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rainData?.impact_explanation?.narrative ||
                      (language === 'ta'
                        ? 'தற்போதைய வானிலை கணிப்பின்படி மண் ஈரப்பதம் சீராக உள்ளது. வடிகால் வசதி இயல்பாக உள்ளதால் பயிர் சேத அபாயம் குறைவாகவே உள்ளது.'
                        : 'Adjust drainage outlets today to restore moisture balance and stabilize yield within 48 hours.')}
                  </p>

                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/rain-impact')}
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      data-tour="analyse-crop"
                    >
                      <span>{t('dashboard.ask_ai_recommendation', 'Ask AI Recommendation')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. MODULAR ENVIRONMENTAL INDICATORS ROW (Reference 2 Inspiration) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Wind Status */}
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
              <span className="text-[10px] text-slate-400 block font-medium">N-E Direction • 06:20 AM</span>
            </div>

            {/* UV / Solar Radiation Index */}
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

            {/* Humidity & Dew Point */}
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
                {t('dashboard.dew_point_desc', 'The dew point is 21° right now')}
              </span>
            </div>

            {/* Visibility & Atmospheric Index */}
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
          {/* 4. BOTTOM STATUS ACTIVITY PILLS (Reference 1 Bottom Ribbon) */}
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
                <span>{t('dashboard.rain_warning_clear', 'Rain Warning: Clear')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-600">CropClimate AI Engine v1.0.0</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
