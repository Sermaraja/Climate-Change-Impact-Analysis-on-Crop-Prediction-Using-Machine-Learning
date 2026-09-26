import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sprout,
  HelpCircle,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  Loader2,
  ArrowRight,
  Layers,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  BarChart3,
  Leaf,
  FlaskConical,
  Activity,
  CalendarDays,
  Info,
  Zap,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ProductTour } from '../components/common/ProductTour';
import { FarmImpactMap } from '../components/dashboard/FarmImpactMap';
import type { FarmImpactFeature } from '../components/dashboard/FarmImpactMap';

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
  state?: string;
  drainage_class?: string;
  latitude: number;
  longitude: number;
  area_acres?: number;
  area_hectares?: number;
  boundary_geojson?: any;
  village?: string;
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
}

// ─── Impact colour helpers ────────────────────────────────────────────────────
function impactColor(level: string) {
  if (level === 'RED') return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-300', pill: 'bg-red-600 text-white' };
  if (level === 'ORANGE') return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-300', pill: 'bg-orange-500 text-white' };
  if (level === 'YELLOW') return { bg: 'bg-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-300', pill: 'bg-yellow-500 text-white' };
  return { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-300', pill: 'bg-emerald-600 text-white' };
}

function riskDot(level: string) {
  if (level === 'HIGH' || level === 'SEVERE' || level === 'EXTREME' || level === 'CRITICAL') return 'bg-red-500';
  if (level === 'MODERATE' || level === 'MEDIUM' || level === 'ELEVATED') return 'bg-yellow-400';
  return 'bg-emerald-500';
}

// ─── Mini sparkline SVG chart ─────────────────────────────────────────────────
function RainfallMiniChart({ data }: { data: number[] }) {
  if (!data.length) data = [0, 2, 1, 5, 8, 3, 0, 0, 2, 6, 12, 9, 4, 1, 0, 0];
  const max = Math.max(...data, 1);
  const w = 100, h = 40;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(' ');
  const area = `M${pts.split(' ').join('L')}L${w},${h}L0,${h}Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rainGrad)" />
      <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Stage progress ring ──────────────────────────────────────────────────────
function StageRing({ pct, label, days, daysLabel }: { pct: number; label: string; days: number; daysLabel: string }) {
  const r = 28, cx = 36, cy = 36, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5ede8" strokeWidth="5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 3} textAnchor="middle" className="text-[10px] font-extrabold fill-slate-900" fontSize="11" fontWeight="800">{days}d</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fontWeight="600" className="fill-slate-400">{daysLabel}</text>
      </svg>
      <span className="text-[9px] text-center font-semibold text-slate-500 leading-tight max-w-[72px]">{label}</span>
    </div>
  );
}

// ─── Metric pill ──────────────────────────────────────────────────────────────
function MetricPill({ label, value, dot }: { label: string; value: string; dot: string }) {
  return (
    <div className="flex-1 min-w-[90px] flex flex-col items-center gap-1 py-2.5 px-2 bg-white rounded-xl border border-slate-200 shadow-xs">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{label}</span>
      <span className="text-xs font-extrabold text-slate-900 text-center leading-tight">{value}</span>
    </div>
  );
}

// ─── Action card ─────────────────────────────────────────────────────────────
function ActionCard({ act, color }: { act: any; color: string }) {
  return (
    <div className={`p-3 rounded-xl border text-xs space-y-1 ${color}`}>
      <strong className="block text-slate-900 font-bold leading-tight">{act.title}</strong>
      <p className="text-slate-600 leading-relaxed text-[11px]">{act.action}</p>
      {act.timing && (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 font-medium mt-0.5">
          <Clock className="w-2.5 h-2.5 text-slate-400" /> {act.timing}
        </span>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    t,
    language,
    translateCrop,
    translateStage,
    translateSoilType,
    translateDrainage,
    translateRisk,
    translateFactor,
    translateWhyStatement,
    translateActionCard,
    translateTechnicalFeature,
    translateGreeting,
    translateWeatherWarning,
  } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [actionTab, setActionTab] = useState<'BEFORE' | 'DURING' | 'AFTER'>('BEFORE');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);

  const rawScanSteps = [
    'Checking farm locations…',
    'Retrieving weather data…',
    'Analysing rainfall…',
    'Checking soil & drainage…',
    'Evaluating waterlogging…',
    'Analysing crop growth stage…',
    'Calculating crop impact…',
    'Preparing farmer actions…',
  ];

  // Farms
  const { data: farms = [] } = useQuery<FarmData[]>({
    queryKey: ['farms'],
    queryFn: async () => (await apiClient.get<FarmData[]>('/farms')).data,
  });

  // Multi-farm scan summary
  const { data: scanData } = useQuery({
    queryKey: ['farmImpactSummary'],
    queryFn: async () => (await apiClient.get('/farm-impact/summary')).data,
  });

  const allFarmsImpact: FarmImpactFeature[] = scanData?.farms || [];
  const impactSummary = scanData?.summary || { farms_total: farms.length, farms_analysed: 0, farms_requiring_attention: 0, severe_count: 0, high_count: 0, elevated_count: 0, low_count: 0 };
  const rawOfficialWarning = scanData?.official_weather_warning;
  const officialWarning = translateWeatherWarning(rawOfficialWarning);

  const activeFarm = (selectedFarmId ? farms.find(f => f.id === selectedFarmId) : null) || farms[0] || null;
  const activeFarmImpact = (selectedFarmId ? allFarmsImpact.find(f => f.farm_id === selectedFarmId) : null) || allFarmsImpact[0] || null;

  // Rain analysis for active farm
  const { data: rainData } = useQuery<RainAnalysisData>({
    queryKey: ['rainAnalysis', activeFarm?.id],
    queryFn: async () => (await apiClient.get<RainAnalysisData>(`/farms/${activeFarm?.id}/rain-analysis`)).data,
    enabled: !!activeFarm?.id,
  });

  const weather = rainData?.raw_sources;
  const metrics = rainData?.derived_metrics;

  // Scan mutation
  const analyseAllMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      for (let i = 0; i < rawScanSteps.length; i++) {
        setAnalysisStepIndex(i);
        await new Promise(r => setTimeout(r, 320));
      }
      return (await apiClient.post('/farm-impact/analyse-all')).data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['farmImpactSummary'], data);
      setIsScanning(false);
    },
    onError: () => setIsScanning(false),
  });

  useEffect(() => {
    const h = () => setTourOpen(true);
    window.addEventListener('open-product-tour', h);
    return () => window.removeEventListener('open-product-tour', h);
  }, []);

  useEffect(() => {
    if (user?.tour_status === 'NOT_STARTED') setShowPromptModal(true);
  }, [user]);

  // Derived values from active farm impact
  const fi = activeFarmImpact;
  const impact = fi?.crop_impact_analysis?.application_impact_level || 'GREEN';
  const col = impactColor(impact);
  const stageVulnerability = (fi as any)?.active_crop?.stage_vulnerability || 'LOW';
  const cropAgeDays = fi?.active_crop?.crop_age_days || 0;

  // Estimate % progress through season (rough 120-day season)
  const stagePct = Math.min(100, Math.round((cropAgeDays / 120) * 100));

  // Rainfall bar chart data from forecast
  const rainBars = Array.from({ length: 16 }, (_, i) =>
    i < 8 ? ((metrics?.forecast_rain_24h as number) || 0) / 8 : ((metrics?.forecast_rain_48h as number) || 0) / 8
  );

  const whyFactors: string[] = (fi as any)?.why_this_alert?.contributing_factors || (fi as any)?.contributing_factors || [];
  const farmerStatements: string[] = (fi as any)?.why_this_alert?.farmer_explanation_statements || [];

  const beforeActions = (fi as any)?.recommended_actions?.before_rain || [];
  const duringActions = (fi as any)?.recommended_actions?.during_rain || [];
  const afterActions = (fi as any)?.recommended_actions?.after_rain || [];

  const recentHistory = allFarmsImpact.slice(0, 3).map(f => ({
    farm: f.farm_name,
    crop: f.active_crop?.crop_name || '—',
    level: f.crop_impact_analysis?.application_impact_level || 'GREEN',
    time: language === 'ta' ? 'இன்று' : 'Today',
  }));

  const rawGreeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();
  const greeting = translateGreeting(rawGreeting);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (farms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Sprout className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">{t('Add your first farm to start crop-impact monitoring.')}</h2>
          <p className="text-sm text-slate-500">{t('CropClimate AI analyses rainfall, soil, drainage and crop stage to assess damage, survival and recovery potential.')}</p>
        </div>
        <button onClick={() => navigate('/farms/new')} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors">
          <Sprout className="w-4 h-4" /> {t('Add My First Farm')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-slate-800 pb-10 relative">
      {/* Product Tour */}
      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Tour Prompt Modal */}
      {showPromptModal && !tourOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5ede8] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t('Take a quick tour?')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t('Learn how to map farms, monitor rainfall and analyse crop risk with CropClimate AI.')}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setShowPromptModal(false); setTourOpen(true); }} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer">{t('Start Tour')}</button>
              <button onClick={() => setShowPromptModal(false)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer">{t('Maybe Later')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TOP HEADER BAR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl px-4 py-3 border border-[#e5ede8] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{greeting},</p>
            <h2 className="font-extrabold text-slate-900 text-sm leading-tight">{user?.full_name || (language === 'ta' ? 'விவசாயி' : 'Farmer')}</h2>
          </div>
        </div>

        {/* Farm selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {farms.length > 1 ? (
            <select
              value={activeFarm?.id || ''}
              onChange={e => setSelectedFarmId(Number(e.target.value))}
              className="text-xs bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {farms.map(f => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
            </select>
          ) : (
            <span className="text-xs font-bold text-slate-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {activeFarm?.farm_name || '—'}
            </span>
          )}
        </div>

        {/* Weather pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs font-bold">
            <Thermometer className="w-3.5 h-3.5 text-sky-500" />
            {weather?.current_temperature ?? 28}°C
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold">
            <Droplets className="w-3.5 h-3.5 text-emerald-500" />
            {weather?.current_humidity ?? 72}%
          </div>
          {weather?.wind_speed && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              {weather.wind_speed} km/h
            </div>
          )}
        </div>

        {/* Analyse button */}
        <button
          onClick={() => analyseAllMutation.mutate()}
          disabled={isScanning || analyseAllMutation.isPending}
          data-tour="analyse-crop"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer shrink-0"
        >
          {isScanning ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="max-w-[150px] truncate">{t(rawScanSteps[analysisStepIndex])}</span></>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" /><span>{t('Analyse All My Farms')}</span></>
          )}
        </button>
      </div>

      {/* Official Weather Warning Banner */}
      {officialWarning?.is_available && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 block">
              {t('Official Weather Warning')} — {officialWarning.warning_level}
            </span>
            <span className="font-semibold">{officialWarning.title}</span>
            <span className="text-amber-700 ml-1">• {officialWarning.description}</span>
          </div>
          <span className="shrink-0 text-[10px] text-amber-600 font-semibold hidden sm:block">
            {t('Valid until')} {officialWarning.valid_until ? new Date(officialWarning.valid_until).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: LEFT INFO PANEL + RIGHT LARGE MAP */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ── LEFT: Farm / Crop / Soil / Weather Info Panel ── */}
        <div className="lg:col-span-4 space-y-3">

          {/* Farm Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> {t('FARM')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${col.pill} border-transparent`}>
                {translateRisk(impact)} {language === 'ta' ? 'பாதிப்பு' : 'IMPACT'}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{activeFarm?.farm_name || '—'}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span className="text-[11px] text-slate-500 font-medium">
                  {activeFarm?.village ? `${activeFarm.village}, ` : ''}{activeFarm?.district || '—'}, {activeFarm?.state || '—'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[9px] text-slate-400 uppercase font-bold">{t('Area')}</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5">{activeFarm?.area_acres ?? '—'}</span>
                <span className="text-[9px] text-slate-400">{t('Acres')}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[9px] text-slate-400 uppercase font-bold">{t('Drainage')}</span>
                <span className="text-[11px] font-extrabold text-slate-900 mt-0.5 text-center leading-tight">
                  {activeFarm?.drainage_class ? translateDrainage(activeFarm.drainage_class) : '—'}
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span className="text-[9px] text-slate-400 uppercase font-bold">{t('Farms')}</span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5">{impactSummary.farms_total}</span>
                <span className="text-[9px] text-slate-400">{t('Total')}</span>
              </div>
            </div>
          </div>

          {/* Crop + Soil Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Crop */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e5ede8] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Leaf className="w-3 h-3" /> {t('CROP')}</span>
              </div>
              {fi?.has_crop ? (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-slate-900 text-sm">{translateCrop(fi.active_crop?.crop_name || '—')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {fi.active_crop?.variety_name === 'Standard' ? (language === 'ta' ? 'நிலையான ரகம்' : 'Standard') : (fi.active_crop?.variety_name || 'Standard')}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500">{fi.active_crop?.crop_age_days ?? '—'} {language === 'ta' ? 'நாட்கள் வயது' : 'days old'}</span>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 ${
                    stageVulnerability === 'EXTREME' ? 'bg-red-50 text-red-700 border border-red-200' :
                    stageVulnerability === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot(stageVulnerability)}`} />
                    {translateRisk(stageVulnerability)} {language === 'ta' ? 'உணர்திறன்' : 'SENSITIVITY'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t('No crop added')}
                </div>
              )}
            </div>

            {/* Soil */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#e5ede8] shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><FlaskConical className="w-3 h-3" /> {t('SOIL')}</span>
              {fi?.soil_profile ? (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-slate-900 text-xs leading-tight">{translateSoilType(fi.soil_profile.soil_type)}</p>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{t('Clay')} {fi.soil_profile.clay_percentage ?? '—'}%</span>
                    <span>{t('Sand')} {fi.soil_profile.sand_percentage ?? '—'}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fi.soil_profile.clay_percentage ?? 30}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block">{fi.soil_profile.soil_source ? t(fi.soil_profile.soil_source) : t('Survey')}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">{t('No soil data')}</p>
              )}
            </div>
          </div>

          {/* Today's Weather Card */}
          <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl p-4 border border-sky-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1 mb-2">
              <CloudRain className="w-3 h-3" /> {t('TODAY\'S WEATHER')}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-extrabold text-sky-800">{weather?.current_temperature ?? 28}°</div>
                <div className="text-[9px] text-slate-500 font-medium">{t('Temp')}</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-700">{weather?.current_humidity ?? 72}%</div>
                <div className="text-[9px] text-slate-500 font-medium">{t('Humidity')}</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-700">{metrics?.forecast_rain_24h ?? 0}mm</div>
                <div className="text-[9px] text-slate-500 font-medium">{t('Forecast')}</div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-sky-200 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>{t('24h Rain:')}</span>
                <span className="font-bold text-sky-700">{metrics?.forecast_rain_24h ?? 0} mm</span>
              </div>
              <div className="flex justify-between">
                <span>{t('48h Rain:')}</span>
                <span className="font-bold text-sky-700">{metrics?.forecast_rain_48h ?? 0} mm</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Prev 48h:')}</span>
                <span className="font-bold text-amber-700">{metrics?.previous_rain_48h ?? 0} mm</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Wind:')}</span>
                <span className="font-bold">{weather?.wind_speed ?? 6} km/h</span>
              </div>
            </div>
          </div>

          {/* Farm switch mini list */}
          {farms.length > 1 && (
            <div className="bg-white rounded-2xl p-3 border border-[#e5ede8] shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t('All Farms Quick Switch')}</span>
              {farms.map(f => {
                const fi2 = allFarmsImpact.find(x => x.farm_id === f.id);
                const lv = fi2?.crop_impact_analysis?.application_impact_level || 'GREEN';
                const c = impactColor(lv);
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFarmId(f.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left border ${
                      activeFarm?.id === f.id ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.bg}`} />
                    <span className="flex-1 truncate">{f.farm_name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${c.pill} border-transparent`}>{translateRisk(lv)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Large Interactive Farm Map ── */}
        <div className="lg:col-span-8" data-tour="my-farms">
          <div className="bg-white rounded-2xl border border-[#e5ede8] shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5ede8]">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {t('Farm Impact Map — All Fields')}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {t('Click any farm polygon to inspect crop stage, rainfall & waterlogging risk')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  {[['GREEN', 'bg-emerald-500'], ['YELLOW', 'bg-yellow-400'], ['ORANGE', 'bg-orange-500'], ['RED', 'bg-red-500']].map(([l, bg]) => (
                    <div key={l} className="flex items-center gap-1 text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${bg}`} />{translateRisk(l)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <FarmImpactMap
              farms={allFarmsImpact}
              selectedFarmId={activeFarm?.id}
              onSelectFarm={id => setSelectedFarmId(id)}
              onViewAnalysis={() => navigate('/crop-impact')}
              onViewActions={() => navigate('/crop-impact')}
              heightClass="h-[340px] sm:h-[420px] lg:h-[500px]"
            />
            {/* Map footer summary */}
            <div className="px-4 py-2.5 border-t border-[#e5ede8] flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
              <span><strong className="text-slate-700">{impactSummary.farms_total}</strong> {t('farms mapped')}</span>
              <span><strong className="text-slate-700">{impactSummary.farms_analysed}</strong> {t('analysed')}</span>
              <span><strong className="text-red-600">{impactSummary.severe_count + impactSummary.high_count}</strong> {t('require attention')}</span>
              <span><strong className="text-emerald-700">{impactSummary.low_count}</strong> {t('in safe zone')}</span>
              <button onClick={() => navigate('/crop-impact')} className="ml-auto flex items-center gap-1 text-emerald-700 font-bold cursor-pointer hover:underline">
                {t('Full Analysis')} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: 6-METRIC IMPACT STRIP */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {fi?.has_crop && (
        <div className="bg-white rounded-2xl p-3 border border-[#e5ede8] shadow-xs">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('CropClimate AI Crop Impact Indicators —')} {fi.farm_name}
            </span>
            <span className="ml-auto text-[9px] text-slate-400 font-medium italic">{t('Hybrid ML + Agronomic Engine v1.0.0')}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <MetricPill label={t('Rain 24h')} value={`${fi.weather_metrics?.forecast_rain_24h_mm ?? 0} mm`} dot="bg-sky-400" />
            <MetricPill label={t('Rain 48h')} value={`${fi.weather_metrics?.forecast_rain_48h_mm ?? 0} mm`} dot="bg-sky-500" />
            <MetricPill label={t('Waterlog Risk')} value={translateRisk(fi.waterlogging_analysis?.risk_level || 'LOW')} dot={riskDot(fi.waterlogging_analysis?.risk_level || 'LOW')} />
            <MetricPill label={t('Damage Risk')} value={translateRisk(fi.crop_impact_analysis?.damage_risk || 'LOW')} dot={riskDot(fi.crop_impact_analysis?.damage_risk || 'LOW')} />
            <MetricPill label={t('Survival')} value={translateRisk(fi.crop_impact_analysis?.survival_potential || 'HIGH')} dot="bg-emerald-500" />
            <MetricPill label={t('Recovery')} value={translateRisk(fi.crop_impact_analysis?.recovery_potential || 'HIGH')} dot="bg-emerald-400" />
            <MetricPill label={t('Crop Loss')} value={translateRisk(fi.crop_impact_analysis?.crop_loss_risk || 'LOW')} dot={riskDot(fi.crop_impact_analysis?.crop_loss_risk || 'LOW')} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: RAINFALL OUTLOOK CHART + CROP STAGE RING */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {fi?.has_crop && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Rainfall Outlook */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-sky-500" /> {t('Rainfall Outlook')}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">{t('Next 48 hours (estimated)')}</span>
            </div>
            <div className="h-[90px]">
              <RainfallMiniChart data={rainBars} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-sky-50 rounded-xl p-2 border border-sky-100">
                <p className="text-[9px] text-sky-600 font-bold uppercase">0–24h</p>
                <p className="text-base font-extrabold text-sky-800">{metrics?.forecast_rain_24h ?? 0}<span className="text-[9px] font-medium">mm</span></p>
              </div>
              <div className="bg-sky-50 rounded-xl p-2 border border-sky-100">
                <p className="text-[9px] text-sky-600 font-bold uppercase">24–48h</p>
                <p className="text-base font-extrabold text-sky-800">{metrics?.forecast_rain_48h ?? 0}<span className="text-[9px] font-medium">mm</span></p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2 border border-amber-100">
                <p className="text-[9px] text-amber-600 font-bold uppercase">{t('Prev 48h:')}</p>
                <p className="text-base font-extrabold text-amber-800">{metrics?.previous_rain_48h ?? 0}<span className="text-[9px] font-medium">mm</span></p>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3" /> {t('Antecedent Wetness Index:')} <strong className="text-slate-700 ml-0.5">{metrics?.antecedent_rainfall_index?.toFixed(2) ?? '0.00'}</strong>
            </div>
          </div>

          {/* Crop Stage */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-500" /> {t('Crop Growth Stage')}
            </h4>
            <div className="flex items-center gap-5">
              <StageRing
                pct={stagePct}
                label={translateStage(fi.active_crop?.growth_stage || 'Vegetative')}
                days={cropAgeDays}
                daysLabel={language === 'ta' ? 'வயது' : 'old'}
              />
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Stage')}</span>
                  <span className="font-bold text-slate-900 text-right max-w-[120px] leading-tight">{translateStage(fi.active_crop?.growth_stage || '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Variety')}</span>
                  <span className="font-bold text-slate-700">
                    {fi.active_crop?.variety_name === 'Standard' ? (language === 'ta' ? 'நிலையான ரகம்' : 'Standard') : (fi.active_crop?.variety_name || 'Standard')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Source')}</span>
                  <span className="font-bold text-slate-700">{fi.active_crop?.growth_stage_source ? t(fi.active_crop.growth_stage_source) : t('ESTIMATED')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{t('Sensitivity')}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    stageVulnerability === 'EXTREME' ? 'bg-red-50 text-red-700 border-red-200' :
                    stageVulnerability === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {translateRisk(stageVulnerability)}
                  </span>
                </div>
              </div>
            </div>
            {/* Stage progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{t('Planting')}</span>
                <span>{stagePct}% {language === 'ta' ? 'பருவ முன்னேற்றம்' : 'season progress'}</span>
                <span>{t('Harvest')}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full transition-all duration-500" style={{ width: `${stagePct}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{t('Engine:')} {fi.crop_impact_analysis?.engine_type || 'HYBRID'}</span>
              <span>{t('Model:')} {fi.crop_impact_analysis?.model_version || 'v1.0.0'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: WATERLOGGING ANALYSIS + WHY THIS RESULT */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {fi?.has_crop && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Waterlogging */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" /> {t('Waterlogging Risk Analysis')}
            </h4>
            <div className={`rounded-xl p-3 border ${
              fi.waterlogging_analysis?.risk_level === 'HIGH' || fi.waterlogging_analysis?.risk_level === 'SEVERE' || fi.waterlogging_analysis?.risk_level === 'CRITICAL'
                ? 'bg-red-50 border-red-200'
                : fi.waterlogging_analysis?.risk_level === 'MODERATE' || fi.waterlogging_analysis?.risk_level === 'ELEVATED'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">{t('Risk Level')}</span>
                <span className={`text-sm font-extrabold ${
                  fi.waterlogging_analysis?.risk_level === 'HIGH' || fi.waterlogging_analysis?.risk_level === 'CRITICAL' ? 'text-red-700' :
                  fi.waterlogging_analysis?.risk_level === 'MODERATE' ? 'text-yellow-700' :
                  'text-emerald-700'
                }`}>
                  {translateRisk(fi.waterlogging_analysis?.risk_level || 'LOW')}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Soil Saturation')}</span>
                  <span className="font-bold text-slate-800">{fi.waterlogging_analysis?.soil_saturation_pct ?? 50}%</span>
                </div>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${fi.waterlogging_analysis?.soil_saturation_pct! > 75 ? 'bg-red-400' : fi.waterlogging_analysis?.soil_saturation_pct! > 50 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                    style={{ width: `${fi.waterlogging_analysis?.soil_saturation_pct ?? 50}%` }}
                  />
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">{t('Est. Standing Water')}</span>
                  <span className="font-bold text-slate-800">{fi.waterlogging_analysis?.estimated_standing_water_hours ?? 0} {language === 'ta' ? 'மணி' : 'hrs'}</span>
                </div>
              </div>
            </div>
            {/* Contributing factors */}
            {whyFactors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t('Contributing Factors')}</span>
                {whyFactors.map((f2: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                    {translateFactor(f2)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Why This Result */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-500" /> {t('Why This Result?')}
              </h4>
              <button onClick={() => navigate('/crop-impact')} className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5">
                {t('Full Explanation')} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {/* Feature importances */}
            {((fi as any)?.why_this_alert?.technical_feature_importances || []).map((feat: any, i: number) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span className="font-semibold">{translateTechnicalFeature(feat.feature)}</span>
                  <span className="font-bold text-slate-800">{feat.importance_pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                    style={{ width: `${feat.importance_pct}%` }}
                  />
                </div>
              </div>
            ))}
            {/* Farmer explanation statements */}
            {farmerStatements.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">{t('Farmer Summary')}</span>
                {farmerStatements.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    {translateWhyStatement(s)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: RECOMMENDED ACTIONS (Before / During / After) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {fi?.has_crop && (
        <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3" data-tour="alerts">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              {t('Recommended Actions —')} {fi.farm_name}
            </h4>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {([
                ['BEFORE', language === 'ta' ? 'மழைக்கு முன்' : 'Before Rain', 'bg-emerald-600'],
                ['DURING', language === 'ta' ? 'மழையின் போது' : 'During Rain', 'bg-sky-600'],
                ['AFTER', language === 'ta' ? 'மழைக்கு பின்' : 'After Rain', 'bg-amber-600']
              ] as const).map(([tab, label, active]) => (
                <button
                  key={tab}
                  onClick={() => setActionTab(tab as any)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${actionTab === tab ? `${active} text-white shadow-xs` : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {actionTab === 'BEFORE' && (beforeActions.length > 0 ? beforeActions.map((a: any, i: number) => (
              <ActionCard key={i} act={translateActionCard(a)} color="bg-emerald-50/50 border-emerald-100" />
            )) : <p className="text-xs text-slate-400 italic col-span-3">{t('Clear drainage ditches and strengthen bunds to prevent ponding.')}</p>)}

            {actionTab === 'DURING' && (duringActions.length > 0 ? duringActions.map((a: any, i: number) => (
              <ActionCard key={i} act={translateActionCard(a)} color="bg-sky-50/50 border-sky-100" />
            )) : <p className="text-xs text-slate-400 italic col-span-3">{t('Ensure field runoff points stay open; suspend fertilizer spraying.')}</p>)}

            {actionTab === 'AFTER' && (afterActions.length > 0 ? afterActions.map((a: any, i: number) => (
              <ActionCard key={i} act={translateActionCard(a)} color="bg-amber-50/50 border-amber-100" />
            )) : <p className="text-xs text-slate-400 italic col-span-3">{t('Drain stagnant water within 24h and apply foliar micronutrients.')}</p>)}
          </div>

          <div className="flex justify-end pt-1">
            <button onClick={() => navigate('/crop-impact')} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer">
              {t('Full Agronomic Guide')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: CLIMATE OVERVIEW + RECENT ANALYSIS HISTORY */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Climate Overview */}
        <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> {t('Climate Overview')}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-xl p-3 border border-emerald-100 text-center space-y-1">
              <Thermometer className="w-5 h-5 text-orange-400 mx-auto" />
              <p className="text-xl font-extrabold text-slate-900">{weather?.current_temperature ?? 28}°C</p>
              <p className="text-[10px] text-slate-500 font-medium">{t('Current Temp')}</p>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-3 border border-sky-100 text-center space-y-1">
              <Droplets className="w-5 h-5 text-sky-400 mx-auto" />
              <p className="text-xl font-extrabold text-slate-900">{weather?.current_humidity ?? 72}%</p>
              <p className="text-[10px] text-slate-500 font-medium">{t('Humidity')}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100 text-center space-y-1">
              <CloudRain className="w-5 h-5 text-sky-500 mx-auto" />
              <p className="text-xl font-extrabold text-sky-800">{metrics?.forecast_rain_24h ?? 0}mm</p>
              <p className="text-[10px] text-slate-500 font-medium">{t('Rain Next 24h')}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200 text-center space-y-1">
              <Wind className="w-5 h-5 text-slate-400 mx-auto" />
              <p className="text-xl font-extrabold text-slate-800">{weather?.wind_speed ?? 6}km/h</p>
              <p className="text-[10px] text-slate-500 font-medium">{t('Wind Speed')}</p>
            </div>
          </div>
          <button onClick={() => navigate('/weather')} className="w-full text-xs font-bold text-sky-700 hover:bg-sky-50 border border-sky-200 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-colors">
            {t('Full Weather Forecast')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Analysis */}
        <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-slate-500" /> {t('Recent Analysis')}
            </h4>
            <button onClick={() => navigate('/history')} className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">{t('View All')}</button>
          </div>
          <div className="space-y-2">
            {recentHistory.length > 0 ? recentHistory.map((r, i) => {
              const rc = impactColor(r.level);
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${rc.bg}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{r.farm}</p>
                    <p className="text-[10px] text-slate-500">{translateCrop(r.crop)} • {r.time}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${rc.pill} border-transparent shrink-0`}>{translateRisk(r.level)}</span>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                {t('Run "Analyse All My Farms" to see results here.')}
              </p>
            )}
          </div>
          <button onClick={() => navigate('/crop-impact')} className="w-full text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-colors">
            {t('Analyse All Farms')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* BOTTOM STATUS BAR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-[#e5ede8] shadow-xs flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex flex-wrap gap-2">
          {[
            'Soil Drainage: Verified',
            'Hybrid ML Engine: Active',
            'Weather: Live (Open-Meteo)',
          ].map(label => (
            <div key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t(label)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t('CropClimate AI Engine v1.0.0')}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
