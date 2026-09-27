import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { History as HistoryIcon, Filter, FileText, X, Loader2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface HistoryItem {
  prediction_id: number;
  timestamp: string;
  farm_id: number;
  farm_name: string;
  crop_name: string;
  variety_name: string;
  growth_stage: string;
  damage_risk_level: string;
  survival_probability: number;
  estimated_yield_loss_pct: number;
  prediction_method: string;
  model_version: string;
  rule_version: string;
  data_source: string;
  explanation_summary: string;
}

export const History: React.FC = () => {
  const { t, language, translateCrop, translateStage, translateRisk } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const { data: historyList = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['predictionHistory', filterRisk],
    queryFn: async () => {
      const url = filterRisk !== 'ALL' ? `/predictions/history?risk_level=${filterRisk}` : '/predictions/history';
      const res = await apiClient.get<HistoryItem[]>(url);
      return res.data;
    },
  });

  const getRiskBadgeStyle = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
      case 'SEVERE':
      case 'EXTREME':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title={t('nav.history', 'Prediction History')}
        subtitle={
          language === 'ta'
            ? 'முழு கணிப்பு வரலாறு மற்றும் அறிவியல் தணிக்கைத் தடம்'
            : 'Complete prediction history & agronomic scientific audit trail'
        }
        action={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="ALL">{language === 'ta' ? 'அனைத்து அபாய நிலைகளும்' : 'All Risk Levels'}</option>
              <option value="LOW">{language === 'ta' ? 'குறைந்த அபாயம்' : 'LOW Risk'}</option>
              <option value="MODERATE">{language === 'ta' ? 'மிதமான அபாயம்' : 'MODERATE Risk'}</option>
              <option value="HIGH">{language === 'ta' ? 'உயர் அபாயம்' : 'HIGH Risk'}</option>
            </select>
          </div>
        }
      />

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-crop-400 mb-2" />
          <p className="text-xs">{language === 'ta' ? 'தணிக்கை வரலாறு ஏற்றப்படுகிறது...' : 'Loading Audit History Logs...'}</p>
        </div>
      )}

      {!isLoading && historyList.length === 0 && (
        <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <HistoryIcon className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">{language === 'ta' ? 'வரலாற்றுப் பதிவுகள் இல்லை' : 'No Prediction History Found'}</h3>
          <p className="text-xs text-slate-400">
            {language === 'ta'
              ? 'தணிக்கைப் பதிவை உருவாக்க ஒரு பண்ணையில் "பயிர் பாதிப்பு பகுப்பாய்வு" இயக்கவும்.'
              : 'Run "Analyse My Crop" on a farm to generate an audit trail record.'}
          </p>
        </div>
      )}

      {historyList.length > 0 && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="p-3.5">{language === 'ta' ? 'பகுப்பாய்வு எண்' : 'Analysis ID'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'தேதி & நேரம்' : 'Timestamp'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'பண்ணை' : 'Farm'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'பயிர் & நிலை' : 'Crop & Stage'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'சேத அபாயம்' : 'Damage Risk'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'மகசூல் இழப்பு %' : 'Yield Loss %'}</th>
                  <th className="p-3.5">{language === 'ta' ? 'முறை' : 'Method'}</th>
                  <th className="p-3.5 text-right">{language === 'ta' ? 'தணிக்கை அறிக்கை' : 'Scientific Audit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historyList.map((item) => (
                  <tr key={item.prediction_id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">#{item.prediction_id}</td>
                    <td className="p-3.5 text-slate-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-medium text-white">{item.farm_name}</td>
                    <td className="p-3.5">{translateCrop(item.crop_name)} ({translateStage(item.growth_stage)})</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadgeStyle(item.damage_risk_level)}`}>
                        {translateRisk(item.damage_risk_level)}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-rose-300">{item.estimated_yield_loss_pct}%</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-crop-300 font-medium">
                        {item.prediction_method}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> {language === 'ta' ? 'தணிக்கையைப் பார்' : 'Inspect Audit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scientific Audit Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-slate-700 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ta' ? 'பகுப்பாய்வு தணிக்கை விவரம்' : 'Analysis Audit Trail'} #{selectedItem.prediction_id}
                </h3>
                <p className="text-[11px] text-slate-400">{language === 'ta' ? 'நேரம்:' : 'Timestamp:'} {selectedItem.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'பண்ணை' : 'Farm'}</span>
                <span className="font-bold text-white">{selectedItem.farm_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'பயிர் & ரகம்' : 'Crop & Variety'}</span>
                <span className="font-bold text-crop-300">{translateCrop(selectedItem.crop_name)} ({selectedItem.variety_name})</span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'வளர்ச்சி நிலை' : 'Growth Stage'}</span>
                <span className="font-bold text-white">{translateStage(selectedItem.growth_stage)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'ta' ? 'சேத அபாயம் & இழப்பு' : 'Damage Risk & Loss'}</span>
                <span className="font-bold text-rose-300">{translateRisk(selectedItem.damage_risk_level)} ({selectedItem.estimated_yield_loss_pct}% {language === 'ta' ? 'இழப்பு' : 'loss'})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white border-b border-slate-800 pb-1">
                {language === 'ta' ? 'அறிவியல் ஆதாரம் & மாதிரி பதிப்புகள்' : 'Scientific Provenance & Model Versions'}
              </h4>
              <p className="text-slate-300">
                <strong>{language === 'ta' ? 'கணிப்பு முறை:' : 'Prediction Method:'}</strong> {selectedItem.prediction_method}
              </p>
              <p className="text-slate-300">
                <strong>{language === 'ta' ? 'மாதிரி பதிப்பு:' : 'Model Version:'}</strong> {selectedItem.model_version}
              </p>
              <p className="text-slate-300">
                <strong>{language === 'ta' ? 'விதி இயந்திர பதிப்பு:' : 'Rule Engine Version:'}</strong> {selectedItem.rule_version}
              </p>
              <p className="text-slate-300">
                <strong>{language === 'ta' ? 'தரவு ஆதாரங்கள்:' : 'Data Sources:'}</strong> {selectedItem.data_source}
              </p>
              <p className="text-slate-400 text-[11px] italic mt-2">
                {language === 'ta' ? 'விளக்கச் சுருக்கம்:' : 'Explanation Summary:'} {selectedItem.explanation_summary}
              </p>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              {language === 'ta' ? 'தணிக்கைப் பார்வையாளரை மூடு' : 'Close Audit Inspector'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
