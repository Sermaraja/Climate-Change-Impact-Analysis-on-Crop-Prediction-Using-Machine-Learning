import React from 'react';
import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CropStageGaugeProps {
  cropName?: string;
  stageName?: string;
  cropAgeDays?: number;
  plantingDate?: string;
  varietyName?: string;
  areaAcres?: number;
}

export const CropStageGauge: React.FC<CropStageGaugeProps> = ({
  cropName = 'Paddy',
  stageName = 'Flowering',
  cropAgeDays = 45,
  plantingDate = '2026-08-12',
  varietyName = 'ADT-45',
  areaAcres = 4.5,
}) => {
  const { t, translateCrop, translateStage, language } = useLanguage();

  // Stages array to calculate percentage & active arc
  const stages = ['Seedling', 'Vegetative', 'Tillering', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'];
  const stageIndex = stages.findIndex((s) => s.toLowerCase() === stageName.toLowerCase());
  const activeIndex = stageIndex >= 0 ? stageIndex : 3;
  const progressPercent = Math.min(100, Math.round(((activeIndex + 1) / stages.length) * 100));

  // Compact circular gauge SVG parameters
  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * progressPercent) / 100;

  const daysRemaining = Math.max(10, 110 - cropAgeDays);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#e5ede8] shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-2.5">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
            {translateCrop(cropName)} {language === 'ta' ? 'விவரம்' : 'Fields'}
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">
            {areaAcres} {t('units.acres', 'Acres')} • {varietyName}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {translateStage(stageName)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Compact Circular Multi-color Gauge (Reference 2) */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-135" viewBox="0 0 130 130">
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#e9f2eb"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Gradient Arc */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="url(#stageGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none pt-1">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-0.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="font-extrabold text-xs text-slate-900 leading-tight">
              {translateStage(stageName)}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              {daysRemaining} {t('dashboard.days_to_maturity', 'days to maturity')}
            </span>
          </div>
        </div>

        {/* Crop Information Table (Reference 2 Style) */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#f8faf8] border border-slate-100">
            <span className="text-slate-500 text-[10px]">{t('cropImpact.crop', 'Crop')}</span>
            <span className="font-bold text-slate-800 text-[11px]">{translateCrop(cropName)}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#f8faf8] border border-slate-100">
            <span className="text-slate-500 text-[10px]">{t('farms.plot_area', 'Size')}</span>
            <span className="font-bold text-slate-800 text-[11px]">{areaAcres} {t('units.acres', 'Acres')}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#f8faf8] border border-slate-100">
            <span className="text-slate-500 text-[10px]">{t('dashboard.crop_age', 'Crop Age')}</span>
            <span className="font-bold text-emerald-700 text-[11px]">{cropAgeDays} {t('units.days', 'Days')}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#f8faf8] border border-slate-100">
            <span className="text-slate-500 text-[10px]">{t('dashboard.sow_date', 'Sow Date')}</span>
            <span className="font-bold text-slate-800 text-[11px]">{plantingDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
