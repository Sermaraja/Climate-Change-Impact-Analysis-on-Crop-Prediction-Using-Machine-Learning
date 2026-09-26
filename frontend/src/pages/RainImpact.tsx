import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, AlertTriangle, Activity, MapPin, Loader2, CheckCircle2,
  HelpCircle, Sprout, HeartPulse, FileText, RefreshCw, Send
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface FarmData {
  id: number;
  farm_name: string;
  district?: string;
  state?: string;
}

interface AnalyseCropResponse {
  analysis_id: number;
  timestamp: string;
  farm_header: {
    farm_id: number;
    farm_name: string;
    crop_name: string;
    variety_name: string;
    crop_age_days: number;
    growth_stage: string;
    soil_type: string;
    drainage_class: string;
  };
  weather_summary: {
    current_temperature_c: number;
    current_humidity_pct: number;
    forecast_rain_24h_mm: number;
    forecast_rain_48h_mm: number;
    previous_rain_48h_mm: number;
    antecedent_wetness_index: number;
  };
  primary_results: {
    application_rain_risk: string;
    waterlogging_risk: string;
    crop_damage_risk: string;
    survival_potential: string;
    recovery_potential: string;
    crop_loss_risk: string;
  };
  why_this_result: {
    prediction_id: number;
    prediction_method: string;
    prediction_method_label: string;
    model_version?: string;
    rule_version?: string;
    confidence_score: number;
    why_this_result: string[];
    main_input_factors: string[];
    data_quality_flags: string[];
    technical_feature_importances: { feature: string; importance_pct: number }[];
  };
  action_recommendations: {
    BEFORE_RAIN: { title: string; action: string; reason: string; timing: string; priority: string; evidence_reference?: string }[];
    DURING_RAIN_EVENT: { title: string; action: string; reason: string; timing: string; priority: string; evidence_reference?: string }[];
    AFTER_RAIN: { title: string; action: string; reason: string; timing: string; priority: string; evidence_reference?: string }[];
  };
  analysis_metadata: {
    engine_type: string;
    model_version?: string;
    rule_version?: string;
    data_quality_flags: string[];
    sources: string[];
  };
}

interface PostRainAssessmentItem {
  id: number;
  assessment_date: string;
  standing_water: string;
  standing_water_duration: string;
  leaf_condition: string;
  plant_condition: string;
  visible_damage: string;
  updated_recovery_potential: string;
  updated_crop_loss_risk: string;
  farmer_notes?: string;
  created_at: string;
}

export const RainImpact: React.FC = () => {
  const { t, language, translateCrop, translateStage, translateSoilType, translateDrainage, translateRisk, translateFactor } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'POST_RAIN'>('ANALYSIS');

  // Post-Rain Assessment Form State
  const [standingWater, setStandingWater] = useState<'YES' | 'NO'>('YES');
  const [standingDuration, setStandingDuration] = useState('12-24 hours');
  const [leafCond, setLeafCond] = useState('Yellowing');
  const [plantCond, setPlantCond] = useState('Standing');
  const [visibleDamage, setVisibleDamage] = useState('Moderate');
  const [notes, setNotes] = useState('');

  // 1. Fetch User Farms
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

  // 2. Execute Analyse My Crop Master Mutation / Query
  const {
    data: analysisData,
    isLoading,
    isError,
    error,
    refetch: runAnalysis,
    isFetching,
  } = useQuery<AnalyseCropResponse>({
    queryKey: ['analyseMyCrop', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.post<AnalyseCropResponse>(`/farms/${activeFarmId}/analyse-rain-impact`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  // 3. Fetch Post-Rain Assessments History
  const { data: postAssessments = [] } = useQuery<PostRainAssessmentItem[]>({
    queryKey: ['postRainAssessments', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.get<PostRainAssessmentItem[]>(`/farms/${activeFarmId}/post-rain-assessment`);
      return res.data;
    },
    enabled: !!activeFarmId && activeTab === 'POST_RAIN',
  });

  // 4. Submit Post-Rain Assessment Mutation
  const postAssessmentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        standing_water: standingWater,
        standing_water_duration: standingDuration,
        leaf_condition: leafCond,
        plant_condition: plantCond,
        visible_damage: visibleDamage,
        farmer_notes: notes,
      };
      const res = await apiClient.post(`/farms/${activeFarmId}/post-rain-assessment`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postRainAssessments', activeFarmId] });
      setNotes('');
      alert(language === 'ta' ? 'மழைக்கு பிந்தைய கள ஆய்வு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Post-Rain Field Assessment submitted successfully!');
    },
  });

  if (farms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title={t('cropImpact.title', 'Farm & Crop Impact')} 
          subtitle={t('cropImpact.subtitle', 'Evaluates heavy rainfall, waterlogging vulnerability, crop damage severity, and post-rain recovery potential.')} 
        />
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <MapPin className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">{t('cropImpact.no_farms', 'No Registered Farms')}</h3>
          <p className="text-xs text-slate-400">
            {language === 'ta' 
              ? 'பயிர் பாதிப்பை பகுப்பாய்வு செய்ய முதலில் ஒரு பண்ணையைப் பதிவு செய்யவும்.' 
              : 'Please register a farm first to analyze crop submergence impact.'}
          </p>
        </div>
      </div>
    );
  }

  const getRiskBadgeStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
      case 'SEVERE':
      case 'EXTREME':
      case 'HIGH_WASH_RISK':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
      case 'MODERATE_WASH_RISK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const header = analysisData?.farm_header;
  const weather = analysisData?.weather_summary;
  const primary = analysisData?.primary_results;
  const why = analysisData?.why_this_result;
  const recs = analysisData?.action_recommendations;
  const latestPost = postAssessments.length > 0 ? postAssessments[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title={t('cropImpact.title', 'Farm & Crop Impact')}
        subtitle={t('cropImpact.subtitle', 'Evaluates heavy rainfall, waterlogging vulnerability, crop damage severity, and post-rain recovery potential.')}
        action={
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => runAnalysis()}
              disabled={isFetching}
              className="px-4 py-1.5 rounded-xl bg-crop-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-crop-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              {t('cropImpact.run_analysis', 'Run Analysis')}
            </button>
          </div>
        }
      />

      {/* Navigation Tabs (Stage 14 vs Stage 16) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('ANALYSIS')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'ANALYSIS' ? 'bg-crop-500/20 text-crop-300 border border-crop-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('cropImpact.tabs.analysis', 'Predictive Impact Analysis (Pre-Rain)')}
        </button>
        <button
          onClick={() => setActiveTab('POST_RAIN')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
            activeTab === 'POST_RAIN' ? 'bg-crop-500/20 text-crop-300 border border-crop-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('cropImpact.tabs.post_rain', 'Post-Rain Field Assessment & Updated Recovery')}
        </button>
      </div>

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-crop-400 mb-2" />
          <p className="text-xs">{t('cropImpact.analyzing', 'Running Hybrid ML & Rule Analysis...')}</p>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">{t('common.error', 'Error')}</p>
            <p className="text-[11px] text-rose-200/80">{(error as any)?.response?.data?.detail || 'Failed to complete analysis.'}</p>
          </div>
        </div>
      )}

      {activeTab === 'ANALYSIS' && analysisData && header && weather && primary && (
        <div className="space-y-6">
          {/* Header Card: Farm & Crop Profile Context */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('farms.farmLocation', 'Farm & Location')}</span>
              <p className="font-bold text-white text-sm">{header.farm_name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('farms.activeCrop', 'Active Crop & Variety')}</span>
              <p className="font-bold text-crop-300 text-sm">{translateCrop(header.crop_name)} ({header.variety_name})</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('farms.cropAgeStage', 'Crop Age & Stage')}</span>
              <p className="font-bold text-white text-sm">{header.crop_age_days} {t('farms.days', 'Days')} ({translateStage(header.growth_stage)})</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('farms.soilDrainage', 'Soil & Drainage Class')}</span>
              <p className="font-bold text-cyan-300 text-sm">{translateSoilType(header.soil_type)} ({translateDrainage(header.drainage_class)})</p>
            </div>
          </div>

          {/* Weather Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('weather.currentTempHumidity', 'Current Temp / Humidity')}</span>
              <span className="text-base font-bold text-white">{weather.current_temperature_c}°C / {weather.current_humidity_pct}%</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('weather.forecast_rain_24h', 'Forecast 24h Rain')}</span>
              <span className="text-base font-bold text-cyan-300">{weather.forecast_rain_24h_mm} mm</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('weather.forecast_rain_48h', 'Forecast 48h Rain')}</span>
              <span className="text-base font-bold text-blue-300">{weather.forecast_rain_48h_mm} mm</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('weather.previous_rain_48h', 'Prior 48h Rain')}</span>
              <span className="text-base font-bold text-purple-300">{weather.previous_rain_48h_mm} mm</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('weather.wetness_index', 'Wetness Index (AWI)')}</span>
              <span className="text-base font-bold text-rose-300">{weather.antecedent_wetness_index}</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">{t('cropImpact.why_this_alert.method', 'Engine Method')}</span>
              <span className="text-xs font-bold text-crop-400">{analysisData.analysis_metadata.engine_type}</span>
            </div>
          </div>

          {/* STAGE 14: 6 Primary Results Badges Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> {t('cropImpact.primaryAssessmentTitle', 'Primary Crop Impact Risk Assessment')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.rain_risk', 'APPLICATION RAIN RISK')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.application_rain_risk)}`}>
                  {translateRisk(primary.application_rain_risk)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.waterlogging_risk', 'WATERLOGGING RISK')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.waterlogging_risk)}`}>
                  {translateRisk(primary.waterlogging_risk)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.crop_damage_risk', 'CROP DAMAGE RISK')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.crop_damage_risk)}`}>
                  {translateRisk(primary.crop_damage_risk)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.survival_potential', 'SURVIVAL POTENTIAL')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.survival_potential)}`}>
                  {translateRisk(primary.survival_potential)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.recovery_potential', 'RECOVERY POTENTIAL')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.recovery_potential)}`}>
                  {translateRisk(primary.recovery_potential)}
                </span>
              </div>
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">{t('cropImpact.metrics.crop_loss_risk', 'CROP LOSS RISK')}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border block text-center ${getRiskBadgeStyle(primary.crop_loss_risk)}`}>
                  {translateRisk(primary.crop_loss_risk)}
                </span>
              </div>
            </div>
          </div>

          {/* STAGE 13: WHY THIS RESULT? (Explainable Prediction Engine) */}
          {why && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> {t('cropImpact.why_this_alert.title', 'WHY THIS RESULT?')}
                </h3>
                <span className="px-3 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                  {t('cropImpact.why_this_alert.method', 'Prediction Method')}: <strong className="text-crop-300">{why.prediction_method_label}</strong>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {why.why_this_result.map((stmt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
                    <span>{translateFactor(stmt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 15: WHAT SHOULD I DO? (Evidence-Based Farmer Action Engine) */}
          {recs && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" /> {t('cropImpact.what_should_i_do.title', 'WHAT SHOULD I DO?')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* BEFORE RAIN */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-amber-300 block border-b border-slate-800 pb-2">
                    {t('cropImpact.what_should_i_do.before_rain', '1. BEFORE RAIN')}
                  </span>
                  {recs.BEFORE_RAIN.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-slate-300">{item.action}</p>
                      <p className="text-[11px] text-slate-500 italic">{t('cropImpact.what_should_i_do.timing', 'Timing')}: {item.timing}</p>
                    </div>
                  ))}
                </div>

                {/* DURING RAIN */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-cyan-300 block border-b border-slate-800 pb-2">
                    {t('cropImpact.what_should_i_do.during_rain', '2. DURING RAIN EVENT')}
                  </span>
                  {recs.DURING_RAIN_EVENT.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-slate-300">{item.action}</p>
                      <p className="text-[11px] text-slate-500 italic">{t('cropImpact.what_should_i_do.timing', 'Timing')}: {item.timing}</p>
                    </div>
                  ))}
                </div>

                {/* AFTER RAIN */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-emerald-300 block border-b border-slate-800 pb-2">
                    {t('cropImpact.what_should_i_do.after_rain', '3. AFTER RAIN')}
                  </span>
                  {recs.AFTER_RAIN.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-slate-300">{item.action}</p>
                      <p className="text-[11px] text-slate-500 italic">{t('cropImpact.what_should_i_do.timing', 'Timing')}: {item.timing}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DATA SOURCES / ANALYSIS METHOD */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <FileText className="w-4 h-4 text-slate-400" /> {t('cropImpact.why_this_alert.sources', 'Data Sources & Scientific Transparency')}
            </div>
            <p>
              {language === 'ta'
                ? 'தரவு ஆதாரங்கள்: Open-Meteo வானிலை மறுபகுப்பாய்வு, SoilGrids, TNAU அக்ரிடெக் நீரில் மூழ்குதல் கையேடு மற்றும் ICAR பயிர் அழுத்த வழிகாட்டுதல்கள்.'
                : 'Data Sources: Open-Meteo Weather Reanalysis, SoilGrids, TNAU Agritech Submergence Manual, and ICAR Abiotic Stress Guidelines.'}
            </p>
            {analysisData.analysis_metadata.data_quality_flags.length > 0 && (
              <p className="text-amber-400/90 text-[11px]">
                {language === 'ta' ? 'தரவு தரக் கொடிகள்: ' : 'Data Quality Flags: '}
                {analysisData.analysis_metadata.data_quality_flags.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* STAGE 16: POST-RAIN FIELD ASSESSMENT TAB */}
      {activeTab === 'POST_RAIN' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" /> {t('cropImpact.post_rain.title', 'Submit Post-Rain Actual Field Observation')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('cropImpact.post_rain.subtitle', 'Record actual observed standing water duration and crop leaf conditions to recalculate your updated recovery potential.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.standing_water', 'Standing Water Present?')}</label>
                <select
                  value={standingWater}
                  onChange={(e) => setStandingWater(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="YES">{language === 'ta' ? 'ஆம் (YES)' : 'YES'}</option>
                  <option value="NO">{language === 'ta' ? 'இல்லை (NO)' : 'NO'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.standing_duration', 'Standing Water Duration')}</label>
                <select
                  value={standingDuration}
                  onChange={(e) => setStandingDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="<6 hours">&lt;6 {language === 'ta' ? 'மணி நேரம்' : 'hours'}</option>
                  <option value="6-12 hours">6-12 {language === 'ta' ? 'மணி நேரம்' : 'hours'}</option>
                  <option value="12-24 hours">12-24 {language === 'ta' ? 'மணி நேரம்' : 'hours'}</option>
                  <option value="24-48 hours">24-48 {language === 'ta' ? 'மணி நேரம்' : 'hours'}</option>
                  <option value=">48 hours">&gt;48 {language === 'ta' ? 'மணி நேரம்' : 'hours'}</option>
                  <option value="Unknown">{language === 'ta' ? 'தெரியவில்லை' : 'Unknown'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.leaf_condition', 'Leaf Condition')}</label>
                <select
                  value={leafCond}
                  onChange={(e) => setLeafCond(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Normal">{language === 'ta' ? 'இயல்பு (Normal)' : 'Normal'}</option>
                  <option value="Yellowing">{language === 'ta' ? 'மஞ்சள் நிறமாதல் (Yellowing)' : 'Yellowing'}</option>
                  <option value="Wilting">{language === 'ta' ? 'வாடுதல் (Wilting)' : 'Wilting'}</option>
                  <option value="Severe damage">{language === 'ta' ? 'கடுமையான சேதம் (Severe damage)' : 'Severe damage'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.plant_condition', 'Plant Condition')}</label>
                <select
                  value={plantCond}
                  onChange={(e) => setPlantCond(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Standing">{language === 'ta' ? 'நேராக நிற்கிறது (Standing)' : 'Standing'}</option>
                  <option value="Partial lodging">{language === 'ta' ? 'பகுதி சாய்ந்தது (Partial lodging)' : 'Partial lodging'}</option>
                  <option value="Severe lodging">{language === 'ta' ? 'முழுமையாக சாய்ந்தது (Severe lodging)' : 'Severe lodging'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.visible_damage', 'Visible Damage Level')}</label>
                <select
                  value={visibleDamage}
                  onChange={(e) => setVisibleDamage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="Low">{language === 'ta' ? 'குறைவு (Low)' : 'Low'}</option>
                  <option value="Moderate">{language === 'ta' ? 'மிதமான (Moderate)' : 'Moderate'}</option>
                  <option value="High">{language === 'ta' ? 'அதிகம் (High)' : 'High'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">{t('cropImpact.post_rain.notes', 'Farmer Notes')}</label>
                <input
                  type="text"
                  placeholder={t('cropImpact.post_rain.notes_placeholder', 'Optional field notes...')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <button
              onClick={() => postAssessmentMutation.mutate()}
              disabled={postAssessmentMutation.isPending}
              className="px-5 py-2 rounded-xl bg-crop-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-crop-400 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {postAssessmentMutation.isPending ? t('common.loading', 'Saving...') : t('cropImpact.post_rain.submit_btn', 'Submit Post-Rain Assessment')}
            </button>
          </div>

          {/* Comparison Card: BEFORE RAIN (Predicted) vs AFTER RAIN (Observed) */}
          {latestPost && primary && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> {language === 'ta' ? 'மழைக்கு முன் vs மழைக்குப் பின் ஒப்பீடு' : 'BEFORE RAIN vs AFTER RAIN Comparison'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* BEFORE RAIN PREDICTED */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-bold text-amber-300 block">{language === 'ta' ? 'மழைக்கு முன் (கணிக்கப்பட்டது)' : 'BEFORE RAIN (Predicted)'}</span>
                  <p className="text-slate-300">{language === 'ta' ? 'கணிக்கப்பட்ட சேதம்:' : 'Predicted Damage:'} <strong>{translateRisk(primary.crop_damage_risk)}</strong></p>
                  <p className="text-slate-300">{language === 'ta' ? 'கணிக்கப்பட்ட நீர் தேக்கம்:' : 'Predicted Waterlogging:'} <strong>{translateRisk(primary.waterlogging_risk)}</strong></p>
                  <p className="text-slate-300">{language === 'ta' ? 'கணிக்கப்பட்ட மீட்பு:' : 'Predicted Recovery:'} <strong>{translateRisk(primary.recovery_potential)}</strong></p>
                </div>

                {/* AFTER RAIN OBSERVED */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-300 block">{language === 'ta' ? 'மழைக்குப் பின் (கள ஆய்வு நிலை)' : 'AFTER RAIN (Observed Field Status)'}</span>
                  <p className="text-slate-300">{language === 'ta' ? 'தேங்கிய நீர் காலம்:' : 'Standing Water Duration:'} <strong>{latestPost.standing_water_duration}</strong></p>
                  <p className="text-slate-300">{language === 'ta' ? 'இலை நிலை:' : 'Observed Leaf Status:'} <strong>{latestPost.leaf_condition}</strong></p>
                  <p className="text-slate-300">{language === 'ta' ? 'புதுப்பிக்கப்பட்ட மீட்பு சாத்தியம்:' : 'UPDATED RECOVERY POTENTIAL:'} <strong className="text-crop-300">{translateRisk(latestPost.updated_recovery_potential)}</strong></p>
                  <p className="text-slate-300">{language === 'ta' ? 'புதுப்பிக்கப்பட்ட பயிர் இழப்பு அபாயம்:' : 'UPDATED CROP LOSS RISK:'} <strong className="text-rose-300">{translateRisk(latestPost.updated_crop_loss_risk)}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
