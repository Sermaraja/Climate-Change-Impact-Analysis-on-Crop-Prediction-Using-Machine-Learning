import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert, CheckCircle2, MapPin, Loader2,
  RefreshCw, Sprout, Info, ChevronRight, Send
} from 'lucide-react';
import { FarmImpactMap } from '../components/dashboard/FarmImpactMap';
import type { FarmImpactFeature } from '../components/dashboard/FarmImpactMap';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const FarmCropImpact: React.FC = () => {
  const {
    t,
    language,
    translateCrop,
    translateStage,
    translateRisk,
    translateFactor,
    translateActionCard,
    translateWeatherWarning,
  } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'SIDE_BY_SIDE' | 'POST_RAIN'>('ANALYSIS');
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Post-Rain Assessment state
  const [standingWater, setStandingWater] = useState<'YES' | 'NO'>('YES');
  const [standingDuration, setStandingDuration] = useState('12-24 hours');
  const [leafCond, setLeafCond] = useState('Yellowing');
  const [plantCond, setPlantCond] = useState('Standing');
  const [visibleDamage] = useState('Moderate');
  const [notes, setNotes] = useState('');

  // 1. Fetch multi-farm impact scan summary and all farm analyses
  const { data: scanData, refetch } = useQuery({
    queryKey: ['farmImpactSummary'],
    queryFn: async () => {
      const res = await apiClient.get('/farm-impact/summary');
      return res.data;
    },
  });

  const farmsList: FarmImpactFeature[] = scanData?.farms || [];
  const summary = scanData?.summary || {
    farms_total: 0,
    farms_analysed: 0,
    farms_requiring_attention: 0,
    severe_count: 0,
    high_count: 0,
    elevated_count: 0,
    low_count: 0,
    no_crop_count: 0
  };
  const rawOfficialWarning = scanData?.official_weather_warning;
  const officialWarning = translateWeatherWarning(rawOfficialWarning);

  // Selected farm object
  const activeFarm = (selectedFarmId ? farmsList.find((f) => f.farm_id === selectedFarmId) : null) || farmsList[0] || null;

  // Mutation: Trigger Analyse All My Farms with real sequential steps
  const analyseSteps = [
    'Checking farm locations…',
    'Retrieving weather data…',
    'Analysing rainfall…',
    'Checking soil & drainage…',
    'Evaluating waterlogging…',
    'Analysing crop growth stage…',
    'Calculating crop impact…',
    'Preparing farmer actions…'
  ];

  const analyseAllMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      for (let i = 0; i < analyseSteps.length; i++) {
        setAnalysisStepIndex(i);
        await new Promise((r) => setTimeout(r, 350));
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

  // Fetch post-rain assessments for active farm
  const { data: postRainList = [], refetch: refetchPostRain } = useQuery({
    queryKey: ['postRainAssessments', activeFarm?.farm_id],
    queryFn: async () => {
      if (!activeFarm?.farm_id) return [];
      const res = await apiClient.get(`/farms/${activeFarm.farm_id}/assessment/history`);
      return res.data;
    },
    enabled: !!activeFarm?.farm_id && activeTab === 'POST_RAIN',
  });

  // Submit Post-Rain Assessment
  const postRainMutation = useMutation({
    mutationFn: async () => {
      if (!activeFarm?.farm_id) return;
      const res = await apiClient.post(`/farms/${activeFarm.farm_id}/assessment`, {
        standing_water: standingWater,
        standing_water_duration: standingDuration,
        leaf_condition: leafCond,
        plant_condition: plantCond,
        visible_damage: visibleDamage,
        farmer_notes: notes,
      });
      return res.data;
    },
    onSuccess: () => {
      refetchPostRain();
      refetch();
      alert(language === 'ta' ? 'மழைக்குப் பிந்தைய கள ஆய்வு வெற்றிகரமாகப் பதிவு செய்யப்பட்டது! பயிர் மீட்பு புதுப்பிக்கப்பட்டது.' : 'Post-rain assessment recorded! Crop recovery updated.');
    },
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5ede8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('Farm & Crop Impact')}
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'ta'
              ? 'வரவிருக்கும் மழை மற்றும் வானிலை உங்கள் ஒவ்வொரு பண்ணை மற்றும் பயிர்களை எவ்வாறு பாதிக்கும் என்பதை அறிந்து கொள்ளுங்கள்.'
              : 'See how upcoming rainfall and weather conditions could affect each of your farms and crops.'}
          </p>
        </div>

        {/* Major CTA: Analyse All My Farms */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => analyseAllMutation.mutate()}
            disabled={isScanning || analyseAllMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">{t(analyseSteps[analysisStepIndex])}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>{t('Analyse All My Farms')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOP SECTION: OFFICIAL WEATHER WARNING VS APPLICATION CROP IMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Official Weather Warning Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5ede8] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-600" />
              {t('Official Weather Warning')}
            </span>
            {officialWarning?.is_available ? (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  officialWarning.warning_level === 'RED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : officialWarning.warning_level === 'ORANGE'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                }`}
              >
                {officialWarning.warning_level}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {t('Unavailable')}
              </span>
            )}
          </div>

          {officialWarning?.is_available ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {officialWarning.title || (language === 'ta' ? 'அரசு மழை முன்னறிவிப்பு' : 'Official Rainfall Advisory')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {officialWarning.description}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                <span>{language === 'ta' ? 'ஆதாரம்:' : 'Source:'} <strong className="text-slate-700">{officialWarning.source}</strong></span>
                <span>{language === 'ta' ? 'பகுதி:' : 'Region:'} <strong className="text-slate-700">{officialWarning.region}</strong></span>
              </div>
            </div>
          ) : (
            <div className="py-3 text-slate-500 text-xs">
              <p className="italic text-slate-600 font-medium">{t('Official warning data unavailable')}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'ta'
                  ? 'இந்த பகுதிக்கான அரசு வானிலை அறிக்கை எதுவும் இல்லை. பண்ணை அபாயங்கள் முன்னறிவிப்பு தரவுகளிலிருந்து கணக்கிடப்படுகின்றன.'
                  : 'No active government bulletin registered for this area. Application will evaluate farm risks from verified forecast telemetry.'}
              </p>
            </div>
          )}
        </div>

        {/* 2. CropClimate AI Farm & Crop Impact Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5ede8] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              {t('CropClimate AI Farm Impact')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {language === 'ta' ? 'பண்ணை சார்ந்த மாதிரி' : 'Farm-Specific Engine'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-center">
              <span className="block text-xl font-bold text-red-700 leading-none">{summary.severe_count}</span>
              <span className="text-[10px] font-bold text-red-600 mt-1 block uppercase">{language === 'ta' ? 'கடுமை (சிவப்பு)' : 'Severe (Red)'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200 text-center">
              <span className="block text-xl font-bold text-orange-700 leading-none">{summary.high_count}</span>
              <span className="text-[10px] font-bold text-orange-600 mt-1 block uppercase">{language === 'ta' ? 'உயர் (ஆரஞ்சு)' : 'High (Orange)'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-yellow-50/80 border border-yellow-200 text-center">
              <span className="block text-xl font-bold text-yellow-800 leading-none">{summary.elevated_count}</span>
              <span className="text-[10px] font-bold text-yellow-700 mt-1 block uppercase">{language === 'ta' ? 'மிதம் (மஞ்சள்)' : 'Elevated (Yellow)'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
              <span className="block text-xl font-bold text-emerald-700 leading-none">{summary.low_count}</span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 block uppercase">{language === 'ta' ? 'குறைவு (பச்சை)' : 'Low (Green)'}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
            <span>
              {language === 'ta'
                ? `${summary.farms_analysed} பண்ணைகளில் ${summary.farms_requiring_attention} பண்ணைகளுக்கு உடனடி கவனம் தேவை`
                : `${summary.farms_requiring_attention} of ${summary.farms_analysed} farms require operational attention`}
            </span>
            {summary.no_crop_count > 0 && (
              <span className="text-amber-700 font-semibold">
                {language === 'ta' ? `${summary.no_crop_count} பண்ணைகளில் பயிர் இல்லை` : `${summary.no_crop_count} farms missing crop`}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Navigation Tabs for Views */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ANALYSIS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ANALYSIS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          {language === 'ta' ? 'பண்ணை பாதிப்பு வரைபடம் & விரிவான ஆய்வு' : 'Farm Impact Map & Detailed Analysis'}
        </button>
        <button
          onClick={() => setActiveTab('SIDE_BY_SIDE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'SIDE_BY_SIDE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          {language === 'ta' ? 'அரசு எச்சரிக்கை vs பண்ணை பாதிப்புகள்' : 'Official Warning vs Farm Impacts (Side-by-Side)'}
        </button>
        <button
          onClick={() => setActiveTab('POST_RAIN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'POST_RAIN'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          {language === 'ta' ? 'மழைக்குப் பிந்தைய கள ஆய்வு' : 'Post-Rain Ground Assessment Loop'}
        </button>
      </div>

      {/* TAB 1: MAIN ANALYSIS & MAP */}
      {activeTab === 'ANALYSIS' && (
        <div className="space-y-6">
          {/* Interactive Map */}
          <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {t('Farm Impact Map — All Fields')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ta'
                    ? 'பயிர் உணர்திறன், வெள்ள பாதிப்பு மற்றும் உரிய நடவடிக்கைகளை அறிய பண்ணை எல்லையைத் தேர்ந்தெடுக்கவும்.'
                    : 'Select any farm boundary to review crop sensitivity, flood vulnerability, and tailored actions.'}
                </p>
              </div>
            </div>

            <FarmImpactMap
              farms={farmsList}
              selectedFarmId={activeFarm?.farm_id}
              onSelectFarm={(id) => setSelectedFarmId(id)}
              onViewAnalysis={(id) => setSelectedFarmId(id)}
              onViewActions={(id) => setSelectedFarmId(id)}
            />
          </div>

          {/* Farms Requiring Attention List Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                {language === 'ta'
                  ? `கவனம் தேவைப்படும் பண்ணைகள் (${summary.farms_requiring_attention})`
                  : `Farms Requiring Attention (${summary.farms_requiring_attention})`}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'ta'
                  ? 'முன்னுரிமை அடிப்படையில் வரிசைப்படுத்தப்பட்டது (கடுமை → உயர் → மிதம் → குறைவு)'
                  : 'Sorted by priority (Severe → High → Elevated → Low)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {farmsList.map((f) => {
                const impactLevel = f.crop_impact_analysis?.application_impact_level || 'UNKNOWN';
                const isSelected = activeFarm?.farm_id === f.farm_id;

                let borderLeftColor = 'border-l-slate-300';
                let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (impactLevel === 'RED') {
                  borderLeftColor = 'border-l-red-600';
                  badgeClass = 'bg-red-50 text-red-700 border-red-200';
                } else if (impactLevel === 'ORANGE') {
                  borderLeftColor = 'border-l-orange-500';
                  badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
                } else if (impactLevel === 'YELLOW') {
                  borderLeftColor = 'border-l-yellow-400';
                  badgeClass = 'bg-yellow-50 text-yellow-800 border-yellow-200';
                } else if (impactLevel === 'GREEN') {
                  borderLeftColor = 'border-l-emerald-500';
                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                }

                return (
                  <div
                    key={f.farm_id}
                    onClick={() => setSelectedFarmId(f.farm_id)}
                    className={`bg-white rounded-xl p-4 border border-[#e5ede8] border-l-4 ${borderLeftColor} shadow-xs transition-all cursor-pointer hover:shadow-md ${
                      isSelected ? 'ring-2 ring-emerald-500/40 bg-emerald-50/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{f.farm_name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {f.district ? `${f.district}, ${f.state || ''}` : (language === 'ta' ? 'பதிவு செய்யப்பட்ட இடம்' : 'Location registered')}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {translateRisk(impactLevel)}
                      </span>
                    </div>

                    {f.has_crop && f.active_crop ? (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>{t('CROP')}:</span>
                          <span className="font-semibold text-slate-900">{translateCrop(f.active_crop.crop_name)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t('Stage')}:</span>
                          <span className="font-semibold text-slate-900">
                            {translateStage(f.active_crop.growth_stage || 'Vegetative')}
                            {f.active_crop.growth_stage_source === 'ESTIMATED' && (
                              <span className="text-[9px] text-amber-600 font-normal ml-1">({t('Estimated')})</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t('Rain 24h')}:</span>
                          <span className="font-semibold text-sky-700">{f.weather_metrics?.forecast_rain_24h_mm ?? 0} mm</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>{t('Waterlog Risk')}:</span>
                          <span className="font-semibold text-slate-900">{translateRisk(f.waterlogging_analysis?.risk_level || 'LOW')}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700 py-1">
                        {language === 'ta' ? 'பயிர் விவரம் சேர்க்கப்படவில்லை' : (f.status_message || 'Missing crop registration')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE FARM DETAILED ANALYSIS BREAKDOWN */}
          {activeFarm && activeFarm.has_crop && (
            <div className="bg-white rounded-2xl p-6 border border-[#e5ede8] shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {activeFarm.farm_name} — {language === 'ta' ? 'விரிவான பயிர் பாதிப்பு பகுப்பாய்வு' : 'Detailed Crop Impact Analysis'}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        activeFarm.crop_impact_analysis?.application_impact_level === 'RED'
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : activeFarm.crop_impact_analysis?.application_impact_level === 'ORANGE'
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : activeFarm.crop_impact_analysis?.application_impact_level === 'YELLOW'
                          ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {translateRisk(activeFarm.crop_impact_analysis?.application_impact_level)} {language === 'ta' ? 'பாதிப்பு' : 'IMPACT RISK'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {translateCrop(activeFarm.active_crop?.crop_name)} • {translateStage(activeFarm.active_crop?.growth_stage || 'Vegetative')} ({activeFarm.active_crop?.growth_stage_source ? t(activeFarm.active_crop.growth_stage_source) : t('ESTIMATED')}) • {activeFarm.area_acres} {t('Acres')}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{language === 'ta' ? 'தரவு முழுமைத்தன்மை:' : 'Data Completeness:'}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {language === 'ta' ? 'வானிலை & வேளாண் சரிபார்க்கப்பட்டது' : 'Telemetric + Agronomic Verified'}
                  </span>
                </div>
              </div>

              {/* Six Scientific Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{language === 'ta' ? 'மழை அபாயம்' : 'Rainfall Risk'}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.crop_impact_analysis?.application_rain_risk || 'MODERATE')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{t('Waterlog Risk')}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.waterlogging_analysis?.risk_level || 'LOW')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{t('Damage Risk')}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.crop_impact_analysis?.damage_risk || 'LOW')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{t('Survival')}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.crop_impact_analysis?.survival_potential || 'HIGH')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{t('Recovery')}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.crop_impact_analysis?.recovery_potential || 'HIGH')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">{t('Crop Loss')}</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {translateRisk(activeFarm.crop_impact_analysis?.crop_loss_risk || 'LOW')}
                  </span>
                </div>
              </div>

              {/* WHY THIS ALERT / CONTRIBUTING FACTORS */}
              <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/70">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-amber-700" />
                  {language === 'ta' ? 'இந்த எச்சரிக்கைக்கான அறிவியல் காரணங்கள் (ஆதார காரணிகள்):' : 'Why This Alert? (Evidence-Based Contributing Factors)'}
                </h3>
                <ul className="space-y-2">
                  {(activeFarm as any).why_this_alert?.contributing_factors?.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{translateFactor(factor)}</span>
                    </li>
                  )) || (
                    <li className="text-xs text-amber-800">
                      {language === 'ta'
                        ? 'மழைப்பொழிவு தீவிரம், முந்தைய மண் ஈரப்பதம் மற்றும் பயிர் வளர்ச்சி பருவ உணர்திறன் ஆகியவற்றின் அடிப்படையில் கணக்கிடப்பட்டது.'
                        : 'Evaluated through multi-factor scientific pipeline: precipitation intensity, antecedent wetness, and growth stage sensitivity.'}
                    </li>
                  )}
                </ul>
              </div>

              {/* RECOMMENDED ACTIONS: BEFORE, DURING, AFTER */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('Recommended Actions')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Before Rain */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {language === 'ta' ? 'மழைக்கு முன் (முன்னுரிமை)' : 'Before Rain (Priority)'}
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(activeFarm as any).recommended_actions?.before_rain?.map((act: any, idx: number) => {
                        const translated = translateActionCard(act);
                        return (
                          <li key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                            <strong className="block text-slate-900 font-semibold">{translated.title}</strong>
                            <span className="text-slate-600 block mt-0.5">{translated.action}</span>
                          </li>
                        );
                      }) || (
                        <li className="text-slate-500 italic">{t('Clear drainage ditches and strengthen bunds to prevent ponding.')}</li>
                      )}
                    </ul>
                  </div>

                  {/* During Rain */}
                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 space-y-2">
                    <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                      {language === 'ta' ? 'மழையின் போது' : 'During Rain Event'}
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(activeFarm as any).recommended_actions?.during_rain?.map((act: any, idx: number) => {
                        const translated = translateActionCard(act);
                        return (
                          <li key={idx} className="bg-white p-2.5 rounded-lg border border-sky-100 shadow-2xs">
                            <strong className="block text-slate-900 font-semibold">{translated.title}</strong>
                            <span className="text-slate-600 block mt-0.5">{translated.action}</span>
                          </li>
                        );
                      }) || (
                        <li className="text-slate-500 italic">{t('Ensure field runoff points stay open; suspend fertilizer spraying.')}</li>
                      )}
                    </ul>
                  </div>

                  {/* After Rain */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                      {language === 'ta' ? 'மழைக்கு பின் (மீட்பு நடவடிக்கைகள்)' : 'After Rain (Recovery)'}
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(activeFarm as any).recommended_actions?.after_rain?.map((act: any, idx: number) => {
                        const translated = translateActionCard(act);
                        return (
                          <li key={idx} className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                            <strong className="block text-slate-900 font-semibold">{translated.title}</strong>
                            <span className="text-slate-600 block mt-0.5">{translated.action}</span>
                          </li>
                        );
                      }) || (
                        <li className="text-slate-500 italic">{t('Drain stagnant water within 24h and apply foliar micronutrients.')}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE OFFICIAL WARNING VS FARM IMPACTS */}
      {activeTab === 'SIDE_BY_SIDE' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5ede8] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'ta'
                ? 'அரசு எச்சரிக்கை vs பண்ணை சார்ந்த பயிர் பாதிப்புகள் ஒப்பீடு'
                : 'Official Warning vs. Farm-Specific Impact Demonstration'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {language === 'ta'
                ? 'அறிவியல் கோட்பாட்டின் நேரலை விளக்கம்: ஒரே வட்டார மழை முன்னறிவிப்பு கூட பயிர் வகை, வளர்ச்சி பருவம், மண் வகை மற்றும் வடிகால் நிலையைப் பொறுத்து வெவ்வேறு பாதிப்புகளை ஏற்படுத்தும்.'
                : 'Demonstrating the core scientific principle: an area-level rainfall warning produces different crop impacts depending on crop, growth stage, soil type, and drainage.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Official Regional Warning */}
            <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {language === 'ta' ? 'அரசு மண்டல வானிலை ஆதாரம்' : 'Regional Government Source'}
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <h3 className="text-base font-bold text-slate-900">
                  {officialWarning?.title || (language === 'ta' ? 'கனமழை எச்சரிக்கை' : 'Heavy Rainfall Warning')}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {officialWarning?.description || (language === 'ta' ? 'விவசாய மண்டலங்களில் குறிப்பிடத்தக்க மழைப்பொழிவு கணிக்கப்பட்டுள்ளது.' : 'Significant precipitation forecasted across agrarian zones.')}
              </p>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <p>{language === 'ta' ? 'நிலை:' : 'Status:'} <strong>{officialWarning?.is_available ? (language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified') : (language === 'ta' ? 'கிடைக்கவில்லை' : 'Unavailable')}</strong></p>
                <p>{language === 'ta' ? 'அதிகாரம்:' : 'Authority:'} <strong>{officialWarning?.source || (language === 'ta' ? 'தேசிய / மாநில வானிலை மையம்' : 'National/State Agency')}</strong></p>
              </div>
            </div>

            {/* Right: How Could This Affect My Farms? */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'ta' ? 'இது என் பண்ணைகளை எவ்வாறு பாதிக்கக்கூடும்?' : 'How Could This Affect My Active Farms?'}
              </h3>

              <div className="space-y-3">
                {farmsList.map((farm) => {
                  const impact = farm.crop_impact_analysis?.application_impact_level || 'UNKNOWN';
                  return (
                    <div
                      key={farm.farm_id}
                      className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{farm.farm_name}</h4>
                          <span className="text-xs text-slate-500">({farm.area_acres} {t('Acres')})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {farm.has_crop ? (
                            <>
                              <strong>{translateCrop(farm.active_crop?.crop_name)}</strong> • {t('Stage')}: {translateStage(farm.active_crop?.growth_stage)}
                            </>
                          ) : (
                            <span className="text-amber-700">{language === 'ta' ? 'செயலில் உள்ள பயிர் விவரம் இல்லை' : 'No active crop assigned'}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            impact === 'RED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : impact === 'ORANGE'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : impact === 'YELLOW'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {translateRisk(impact)} {language === 'ta' ? 'பாதிப்பு' : 'IMPACT'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedFarmId(farm.farm_id);
                            setActiveTab('ANALYSIS');
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POST-RAIN GROUND ASSESSMENT LOOP */}
      {activeTab === 'POST_RAIN' && (
        <div className="bg-white rounded-2xl p-6 border border-[#e5ede8] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'ta'
                ? `மழைக்குப் பிந்தைய கள ஆய்வு பதிவு — ${activeFarm?.farm_name}`
                : `Post-Rain Ground Assessment Loop — ${activeFarm?.farm_name}`}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {language === 'ta'
                ? 'மழை பெய்த பிறகு, உங்கள் வயலை ஆய்வு செய்து அவதானிப்புகளை சமர்ப்பிக்கவும். பயிரின் உயிர்வாழும் திறன், சேத அளவு மற்றும் மீட்பு ஆலோசனைகளை அமைப்பு மறுமதிப்பீடு செய்யும்.'
                : 'After a rainfall event, inspect your field and submit observations. The system recalculates survival, damage, and post-drain recovery potential.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Observation Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'வயலில் தண்ணீர் தேங்கியிருந்ததா?' : 'Standing Water Observed?'}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStandingWater('YES')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      standingWater === 'YES'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {language === 'ta' ? 'ஆம், தண்ணீர் தேங்கியது' : 'Yes, Standing Water Present'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandingWater('NO')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      standingWater === 'NO'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {language === 'ta' ? 'இல்லை, தண்ணீர் தேங்கவில்லை' : 'No Water Stagnation'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'தண்ணீர் தேங்கியிருந்த தோராய கால அளவு' : 'Estimated Standing Water Duration'}
                </label>
                <select
                  value={standingDuration}
                  onChange={(e) => setStandingDuration(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Under 6 hours">{language === 'ta' ? '6 மணி நேரத்திற்கும் குறைவாக' : 'Under 6 hours'}</option>
                  <option value="6-12 hours">{language === 'ta' ? '6-12 மணி நேரம்' : '6-12 hours'}</option>
                  <option value="12-24 hours">{language === 'ta' ? '12-24 மணி நேரம்' : '12-24 hours'}</option>
                  <option value="24-48 hours">{language === 'ta' ? '24-48 மணி நேரம்' : '24-48 hours'}</option>
                  <option value="Over 48 hours">{language === 'ta' ? '48 மணி நேரத்திற்கும் மேல் (தீவிர மூழ்குதல்)' : 'Over 48 hours (Severe Submergence)'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'பயிர் இலைகளின் நிலை' : 'Leaf Condition'}
                  </label>
                  <select
                    value={leafCond}
                    onChange={(e) => setLeafCond(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Normal Green">{language === 'ta' ? 'வழக்கமான பச்சை' : 'Normal Green'}</option>
                    <option value="Yellowing">{language === 'ta' ? 'மஞ்சளாதல் / குளோரோசிஸ்' : 'Yellowing / Chlorosis'}</option>
                    <option value="Necrosis">{language === 'ta' ? 'கருகல் / பழுப்பு திட்டுக்கள்' : 'Necrosis / Brown Patches'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'பயிர் சாய்ந்த நிலை' : 'Plant Lodging'}
                  </label>
                  <select
                    value={plantCond}
                    onChange={(e) => setPlantCond(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Standing">{language === 'ta' ? 'செங்குத்தாக நிற்கிறது' : 'Standing Upright'}</option>
                    <option value="Partially Lodged">{language === 'ta' ? 'பகுதியளவு சாய்ந்தது (<30%)' : 'Partially Lodged (<30%)'}</option>
                    <option value="Severely Lodged">{language === 'ta' ? 'கடுமையாக சாய்ந்தது (>50%)' : 'Severely Lodged (>50%)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'விவசாயியின் களக் குறிப்புகள்' : 'Farmer Field Notes'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ta' ? 'வடிகால் வாய்க்கால் நிலை, வண்டல் அடைப்பு அல்லது வேர் வெளியே தெரிந்தால் குறிப்பிடவும்...' : 'Record drainage ditch status, silt deposition, or root exposure...'}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <button
                type="button"
                onClick={() => postRainMutation.mutate()}
                disabled={postRainMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'கள ஆய்வை சமர்ப்பி' : 'Submit Ground Observation'}</span>
              </button>
            </div>

            {/* Assessment History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'ta'
                  ? `கள ஆய்வு வரலாறு (${postRainList.length})`
                  : `Ground Assessment History (${postRainList.length})`}
              </h4>
              {postRainList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  {language === 'ta'
                    ? 'இந்த பண்ணைக்கு இதுவரை கள ஆய்வுகள் எதுவும் சமர்ப்பிக்கப்படவில்லை.'
                    : 'No post-rain assessments submitted yet for this farm.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {postRainList.map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>
                          {language === 'ta' ? 'ஆய்வு முடிவு:' : 'Observation:'}{' '}
                          {item.standing_water === 'YES'
                            ? (language === 'ta' ? 'தண்ணீர் தேங்கியது' : 'Waterlogged')
                            : (language === 'ta' ? 'தண்ணீர் தேங்கவில்லை' : 'Dry')}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.created_at?.slice(0, 10)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {language === 'ta'
                          ? `கால அளவு: ${item.standing_water_duration} • இலை: ${item.leaf_condition} • சாய்வு: ${item.plant_condition}`
                          : `Duration: ${item.standing_water_duration} • Leaf: ${item.leaf_condition} • Lodging: ${item.plant_condition}`}
                      </p>
                      {item.farmer_notes && (
                        <p className="text-[11px] text-slate-500 italic">"{item.farmer_notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmCropImpact;
