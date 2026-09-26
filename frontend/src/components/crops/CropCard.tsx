import React, { useState } from 'react';
import type { FarmCropData } from '../../types/crop';
import { Sprout, Calendar, Clock, Edit3, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';
import { CropModal } from './CropModal';
import { useLanguage } from '../../context/LanguageContext';

interface CropCardProps {
  farmId: number;
  crop: FarmCropData | null;
  onRefresh?: () => void;
}

export const CropCard: React.FC<CropCardProps> = ({ farmId, crop }) => {
  const { language, translateCrop, translateStage } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!crop) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-crop-500/10 text-crop-400 flex items-center justify-center mx-auto border border-crop-500/20">
          <Sprout className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">
            {language === 'ta' ? 'செயலில் உள்ள பயிர் விவரம் இல்லை' : 'No Active Crop Profile'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'ta'
              ? 'வளர்ச்சி நிலைகளைக் கண்காணிக்கவும் மழை பாதிப்பு பகுப்பாய்வை இயக்கவும் இந்த பண்ணைக்கு பயிரை ஒதுக்குங்கள்.'
              : 'Assign a crop profile to this farm to track growth stage development and enable rain impact vulnerability modeling.'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-crop-500 to-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-crop-500/20"
        >
          <Sprout className="w-4 h-4" />
          <span>{language === 'ta' ? 'பயிர் விவரத்தைச் சேர்' : 'Add Crop Profile'}</span>
        </button>

        <CropModal
          farmId={farmId}
          existingCrop={null}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  const isConfirmed = !!crop.confirmed_growth_stage;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crop-500/30 to-emerald-500/10 text-crop-300 flex items-center justify-center border border-crop-500/40 shadow-inner">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{translateCrop(crop.crop_name)}</h2>
              {crop.scientific_name && (
                <span className="text-[11px] text-slate-400 italic">({crop.scientific_name})</span>
              )}
            </div>
            <p className="text-xs text-crop-400 font-medium">
              {crop.variety_name ? `${language === 'ta' ? 'ரகம்' : 'Variety'}: ${crop.variety_name}` : (language === 'ta' ? 'நிலையான / குறிப்பிடப்படாத ரகம்' : 'Standard / Unspecified Variety')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-crop-400" />
          <span>{language === 'ta' ? 'பயிரைத் திருத்து' : 'Edit Crop'}</span>
        </button>
      </div>

      {/* Grid of Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Crop Age */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'ta' ? 'பயிர் வயது' : 'Crop Age'}</span>
          </div>
          <p className="text-base font-bold text-white">{crop.crop_age_days} {language === 'ta' ? 'நாட்கள்' : 'Days'}</p>
        </div>

        {/* Growth Stage */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ta' ? 'வளர்ச்சி நிலை' : 'Growth Stage'}</span>
          </div>
          <p className="text-xs font-bold text-crop-300 truncate">{translateStage(crop.growth_stage)}</p>
        </div>

        {/* Planting Date */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'ta' ? 'நடவு தேதி' : 'Planting Date'}</span>
          </div>
          <p className="text-xs font-bold text-white">{crop.planting_date}</p>
        </div>

        {/* Season */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ta' ? 'பருவம் / நிலை' : 'Season / Status'}</span>
          </div>
          <p className="text-xs font-bold text-slate-200">
            {crop.season || 'Standard'} ({crop.status})
          </p>
        </div>
      </div>

      {/* Growth Stage Disclaimer & Farmer Confirmation Section */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {language === 'ta' ? 'மதிப்பிடப்பட்ட வளர்ச்சி நிலை:' : 'Estimated Growth Stage:'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {translateStage(crop.estimated_growth_stage)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-white">{language === 'ta' ? 'உறுதிப்படுத்தப்பட்ட நிலை:' : 'Confirmed Stage:'}</span>
              {isConfirmed ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {translateStage(crop.confirmed_growth_stage || '')}
                </span>
              ) : (
                <span className="text-slate-400 italic text-[11px]">{language === 'ta' ? 'விவசாயியால் இன்னும் உறுதிப்படுத்தப்படவில்லை' : 'Not confirmed by farmer yet'}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-crop-500/10 hover:bg-crop-500/20 text-crop-300 border border-crop-500/30 text-[11px] font-semibold whitespace-nowrap transition-colors"
          >
            {isConfirmed ? (language === 'ta' ? 'உறுதிப்படுத்திய நிலையை மாற்று' : 'Change Confirmed Stage') : (language === 'ta' ? 'நிலையை உறுதி செய் / மாற்று' : 'Confirm / Override Stage')}
          </button>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/80">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>{language === 'ta' ? 'குறிப்பு:' : 'Note:'}</strong> {language === 'ta' ? 'வளர்ச்சி நிலை மதிப்பீடு நடவு தேதியிலிருந்து கணக்கிடப்படுகிறது. களத்தில் உங்கள் தற்போதைய நிலையை உறுதிப்படுத்தவும்.' : 'Growth stage estimation is calculated from planting date and standard crop day ranges. It is not guaranteed correct. Please confirm your actual field stage.'}
          </span>
        </div>
      </div>

      <CropModal
        farmId={farmId}
        existingCrop={crop}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
