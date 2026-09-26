import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { Printer, Loader2 } from 'lucide-react';
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
    prediction_method_label: string;
    why_this_result: string[];
  };
  action_recommendations: {
    BEFORE_RAIN: { title: string; action: string }[];
    DURING_RAIN_EVENT: { title: string; action: string }[];
    AFTER_RAIN: { title: string; action: string }[];
  };
  analysis_metadata: {
    engine_type: string;
    model_version?: string;
    rule_version?: string;
    sources: string[];
  };
}

export const Reports: React.FC = () => {
  const { t, language, translateCrop, translateStage, translateSoilType, translateDrainage, translateRisk, translateFactor, translateActionCard } = useLanguage();
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [reportLang, setReportLang] = useState<'en' | 'ta'>(language);

  // Sync reportLang if app language changes initially, but allow independent toggle
  React.useEffect(() => {
    setReportLang(language);
  }, [language]);

  const isTa = reportLang === 'ta';

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

  const { data: reportData, isLoading } = useQuery<AnalyseCropResponse>({
    queryKey: ['analyseMyCrop', activeFarmId],
    queryFn: async () => {
      const res = await apiClient.post<AnalyseCropResponse>(`/farms/${activeFarmId}/analyse-rain-impact`);
      return res.data;
    },
    enabled: !!activeFarmId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title={t('reports.title', 'Farm Rain Impact Reports')}
        subtitle={
          language === 'ta'
            ? 'அதிகாரப்பூர்வ அச்சிடத்தக்க / பதிவிறக்கக்கூடிய பண்ணை மழை பாதிப்பு அறிக்கை'
            : 'Official printable / downloadable Farm Rain Impact Report'
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Report Language Selector (Section 24) */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl p-1">
              <span className="text-[11px] text-slate-400 px-2 font-medium">
                {language === 'ta' ? 'அறிக்கை மொழி:' : 'Report Language:'}
              </span>
              <button
                type="button"
                onClick={() => setReportLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isTa
                    ? 'bg-crop-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setReportLang('ta')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isTa
                    ? 'bg-crop-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>

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
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-crop-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-crop-400 transition-colors shadow-lg shadow-crop-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> {language === 'ta' ? 'அறிக்கையைப் பதிவிறக்கு' : 'Download / Print Report'}
            </button>
          </div>
        }
      />

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-crop-400 mb-2" />
          <p className="text-xs">
            {language === 'ta'
              ? 'அதிகாரப்பூர்வ அறிக்கை உருவாக்கப்படுகிறது...'
              : 'Generating Professional PDF/Printable Report...'}
          </p>
        </div>
      )}

      {reportData && (
        <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6 bg-slate-950 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none font-sans">
          {/* Printable Report Header */}
          <div className="border-b border-slate-800 print:border-gray-300 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white print:text-gray-900">
                {isTa
                  ? 'பயிர் கணிப்பில் காலநிலை மாற்ற தாக்க பகுப்பாய்வு'
                  : 'Climate Change Impact Analysis on Crop Prediction'}
              </h1>
              <p className="text-xs text-crop-300 print:text-gray-600 font-medium">
                {isTa
                  ? 'அதிகாரப்பூர்வ பண்ணை மழை மற்றும் நீரில் மூழ்குதல் பாதிப்பு மதிப்பீட்டு அறிக்கை'
                  : 'Official Farm Rain & Submergence Impact Assessment Report'}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400 print:text-gray-600 space-y-0.5">
              <p>
                <strong>{isTa ? 'பகுப்பாய்வு எண்:' : 'Analysis ID:'}</strong> #{reportData.analysis_id}
              </p>
              <p>
                <strong>{isTa ? 'தேதி:' : 'Date:'}</strong> {new Date(reportData.timestamp).toLocaleDateString(isTa ? 'ta-IN' : 'en-US')}
              </p>
            </div>
          </div>

          {/* Section 1: Farm & Crop Profile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300">
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block uppercase font-semibold">
                {isTa ? 'பண்ணை பெயர்' : 'Farm Name'}
              </span>
              <span className="font-bold text-white print:text-gray-900">{reportData.farm_header.farm_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block uppercase font-semibold">
                {isTa ? 'பயிர் & ரகம்' : 'Crop & Variety'}
              </span>
              <span className="font-bold text-crop-300 print:text-gray-900">
                {isTa ? translateCrop(reportData.farm_header.crop_name) : reportData.farm_header.crop_name} ({reportData.farm_header.variety_name})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block uppercase font-semibold">
                {isTa ? 'பயிர் வயது & நிலை' : 'Crop Age & Stage'}
              </span>
              <span className="font-bold text-white print:text-gray-900">
                {reportData.farm_header.crop_age_days} {isTa ? 'நாட்கள்' : 'Days'} ({isTa ? translateStage(reportData.farm_header.growth_stage) : reportData.farm_header.growth_stage})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 block uppercase font-semibold">
                {isTa ? 'மண் & வடிகால்' : 'Soil & Drainage'}
              </span>
              <span className="font-bold text-cyan-300 print:text-gray-900">
                {isTa ? translateSoilType(reportData.farm_header.soil_type) : reportData.farm_header.soil_type} ({isTa ? translateDrainage(reportData.farm_header.drainage_class) : reportData.farm_header.drainage_class})
              </span>
            </div>
          </div>

          {/* Section 2: Primary Risk Assessment Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-white print:text-gray-900 text-sm">
              {isTa ? '1. முதன்மை பயிர் பாதிப்பு மதிப்பீடு' : '1. Primary Crop Impact Evaluation'}
            </h3>
            <table className="w-full text-left border-collapse border border-slate-800 print:border-gray-300">
              <thead>
                <tr className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-gray-800 text-[11px]">
                  <th className="p-2 border border-slate-800 print:border-gray-300">{isTa ? 'அளவீடு' : 'Metric'}</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300">{isTa ? 'மதிப்பிடப்பட்ட நிலை' : 'Evaluated Level'}</th>
                  <th className="p-2 border border-slate-800 print:border-gray-300">{isTa ? 'விளக்கம்' : 'Interpretation'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'செயலியின் பயிர் பாதிப்பு அபாயம்' : 'Application Rain Risk'}</td>
                  <td className="p-2 font-bold text-amber-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.application_rain_risk) : reportData.primary_results.application_rain_risk}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'உரம் மற்றும் தெளிப்பு மருந்துகள் மழையால் அடித்துச் செல்லப்படும் அபாயம்' : 'Washout risk for spray/chemical applications'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'நீர் தேக்க அபாயம்' : 'Waterlogging Risk'}</td>
                  <td className="p-2 font-bold text-cyan-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.waterlogging_risk) : reportData.primary_results.waterlogging_risk}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'மண் நீர் செறிவூட்டல் மற்றும் தண்ணீர் தேங்கி நிற்கும் சாத்தியம்' : 'Soil saturation and stagnation potential'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'பயிர் சேத அபாயம்' : 'Crop Damage Risk'}</td>
                  <td className="p-2 font-bold text-rose-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.crop_damage_risk) : reportData.primary_results.crop_damage_risk}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'பயிர் திசு சேதம், மூழ்குதல் மற்றும் இலை மஞ்சள் நிறமாதல் அபாயம்' : 'Physiological tissue damage & chlorosis risk'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'பயிர் உயிர்வாழும் சாத்தியம்' : 'Survival Potential'}</td>
                  <td className="p-2 font-bold text-emerald-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.survival_potential) : reportData.primary_results.survival_potential}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'வெள்ளம் வடிந்த பிறகு பயிர் உயிர்வாழும் எதிர்பார்க்கப்படும் திறன்' : 'Expected plant survival after flood recedes'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'பயிர் மீட்பு சாத்தியம்' : 'Recovery Potential'}</td>
                  <td className="p-2 font-bold text-crop-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.recovery_potential) : reportData.primary_results.recovery_potential}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'வடிகாலுக்குப் பின் பயிரை இயல்பு நிலைக்கு மீட்டெடுக்கும் வேகம்' : 'TNAU evidence-based post-drain recovery speed'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">{isTa ? 'பயிர் இழப்பு அபாயம்' : 'Crop Loss Risk'}</td>
                  <td className="p-2 font-bold text-rose-300 print:text-gray-900">
                    {isTa ? translateRisk(reportData.primary_results.crop_loss_risk) : reportData.primary_results.crop_loss_risk}
                  </td>
                  <td className="p-2 text-slate-400 print:text-gray-600">
                    {isTa ? 'விவசாய மகசூல் இழப்பு மற்றும் நிதி இழப்பு சாத்தியம்' : 'Financial yield loss probability'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Why This Result */}
          <div className="space-y-2">
            <h3 className="font-bold text-white print:text-gray-900 text-sm">
              {isTa ? '2. இந்த கணிப்புக்கான அறிவியல் காரணங்கள்' : '2. Plain-Language Explanation Statements'}
            </h3>
            <ul className="space-y-1 list-disc list-inside text-slate-300 print:text-gray-700">
              {reportData.why_this_result.why_this_result.map((stmt, i) => (
                <li key={i}>{isTa ? translateFactor(stmt) : stmt}</li>
              ))}
            </ul>
          </div>

          {/* Section 4: Recommended Actions */}
          <div className="space-y-2">
            <h3 className="font-bold text-white print:text-gray-900 text-sm">
              {isTa ? '3. பரிந்துரைக்கப்பட்ட வேளாண் செயல் திட்டம்' : '3. Actionable Agronomic Plan'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/60 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <strong className="block text-amber-300 print:text-gray-900 mb-1">
                  {isTa ? 'மழைக்கு முன்' : 'Before Rain'}
                </strong>
                {reportData.action_recommendations.BEFORE_RAIN.map((a, i) => {
                  const item = isTa ? translateActionCard(a) : a;
                  return <p key={i} className="text-slate-300 print:text-gray-700">• {item.title}: {item.action}</p>;
                })}
              </div>
              <div className="p-3 bg-slate-900/60 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <strong className="block text-cyan-300 print:text-gray-900 mb-1">
                  {isTa ? 'மழையின் போது' : 'During Rain'}
                </strong>
                {reportData.action_recommendations.DURING_RAIN_EVENT.map((a, i) => {
                  const item = isTa ? translateActionCard(a) : a;
                  return <p key={i} className="text-slate-300 print:text-gray-700">• {item.title}: {item.action}</p>;
                })}
              </div>
              <div className="p-3 bg-slate-900/60 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <strong className="block text-emerald-300 print:text-gray-900 mb-1">
                  {isTa ? 'மழைக்குப் பிறகு' : 'After Rain'}
                </strong>
                {reportData.action_recommendations.AFTER_RAIN.map((a, i) => {
                  const item = isTa ? translateActionCard(a) : a;
                  return <p key={i} className="text-slate-300 print:text-gray-700">• {item.title}: {item.action}</p>;
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Scientific Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900 print:bg-gray-200 border border-slate-800 print:border-gray-400 space-y-1.5 text-[11px] text-slate-400 print:text-gray-800">
            <p className="font-bold text-amber-300 print:text-gray-900">
              {isTa ? 'அறிவியல் & முடிவு ஆதரவு மறுப்புரை:' : 'MSc Academic & Decision-Support Disclaimer:'}
            </p>
            <p>
              {isTa ? 'மாதிரி பதிப்பு:' : 'Model Version:'} {reportData.analysis_metadata.model_version || 'v1.0.0'} | {isTa ? 'விதி இயந்திரம்:' : 'Rule Engine:'} {reportData.analysis_metadata.rule_version || 'v1.0.0-tnau-icar'} | {isTa ? 'இயந்திர வகை:' : 'Engine Type:'} {reportData.analysis_metadata.engine_type}
            </p>
            <p className="italic">
              <strong>{isTa ? 'முக்கிய குறிப்பு:' : 'IMPORTANT:'}</strong>{' '}
              {isTa
                ? 'இந்த அறிக்கையில் உள்ள மாதிரிகள் மற்றும் அபாயக் கணிப்புகள் செயற்கைக்கோள் வானிலை மறுபகுப்பாய்வு மற்றும் பல்கலைக்கழக வேளாண் வழிகாட்டுதல்களிலிருந்து பெறப்பட்ட முடிவு ஆதரவு மதிப்பீடுகளாகும். இவை உத்திரவாதமளிக்கப்பட்ட விவசாய முடிவுகள் அல்ல.'
                : 'Model and risk predictions contained in this report are decision-support estimates derived from satellite meteorological reanalysis and university agronomic guidelines. They do not constitute guaranteed agricultural outcomes.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
