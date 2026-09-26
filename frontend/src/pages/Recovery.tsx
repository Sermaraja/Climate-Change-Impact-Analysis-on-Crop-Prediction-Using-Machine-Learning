import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Activity, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Recovery: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div>
      <PageHeader
        title={language === 'ta' ? 'பயிர் உயிர்வாழும் & மீட்பு மாதிரி' : 'Crop Survival & Post-Rain Recovery Engine'}
        subtitle={
          language === 'ta'
            ? 'நீர் வடிந்த பிறகு பயிர் மீட்பு சாத்தியத்தை கணித்து, மழைக்கு முன்/பின் செயல்வழிகாட்டலை வழங்குகிறது'
            : 'Predicts crop recovery feasibility after water drainage and delivers before/after actionable guidance'
        }
        badge={language === 'ta' ? 'செயல் வழிகாட்டுதல்' : 'Actionable Intelligence'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Before Rain Actions */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {language === 'ta' ? '1. மழைக்கு முன் (முன்னெச்சரிக்கை நடவடிக்கைகள்)' : 'Before Heavy Rain (Pre-Event Actions)'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ta' ? 'உடனடி கள தயாரிப்பு நடவடிக்கைகள்' : 'Immediate field preparation steps'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">
                  {language === 'ta' ? 'வடிகால் வாய்க்கால்களை தூர்வாரவும்:' : 'Clear Peripheral Drainage Channels:'}{' '}
                </strong>
                {language === 'ta'
                  ? 'தண்ணீர் விரைவாக வெளியேற வரப்பு மற்றும் வாய்க்கால்களில் உள்ள கழிவுகளை அகற்றவும்.'
                  : 'Remove silt and debris from field bund outlets to accelerate water discharge.'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">
                  {language === 'ta' ? 'நைட்ரஜன் உரம் இடுவதை நிறுத்தவும்:' : 'Suspend Nitrogen Top-Dressing:'}{' '}
                </strong>
                {language === 'ta'
                  ? 'மழையால் உரம் அடித்துச் செல்லப்படுவதைத் தடுக்க யூரியா இடுவதைத் தவிர்க்கவும்.'
                  : 'Avoid applying urea immediately before heavy rain to prevent fertilizer leaching.'}
              </div>
            </div>
          </div>
        </div>

        {/* After Rain Recovery Actions */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {language === 'ta' ? '2. மழைக்குப் பிறகு (பயிர் மீட்பு நடவடிக்கைகள்)' : 'After Rain Drainage (Post-Event Recovery)'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ta' ? 'இலைவழி தெளிப்பு மற்றும் வேர் புத்துணர்ச்சி' : 'Foliar spray and root restoration'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">
                  {language === 'ta' ? '1% பொட்டாசியம் நைட்ரேட் (KNO3) இலைவழி தெளிப்பு:' : 'Foliar Spray of 1% Potassium Nitrate (KNO3):'}{' '}
                </strong>
                {language === 'ta'
                  ? 'தேங்கிய நீர் வடிந்தவுடன் பயிரின் வீரியத்தை அதிகரிக்கவும் வேர் சுவாசத்தை மீட்டெடுக்கவும் தெளிக்கவும்.'
                  : 'Apply once stagnant water recedes to boost plant vigor and root respiration.'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">
                  {language === 'ta' ? 'பூஞ்சாணக்கொல்லி தெளிப்பு (கார்பென்டாசிம் + மேன்கோசெப்):' : 'Fungicide Application (Carbendazim + Mancozeb):'}{' '}
                </strong>
                {language === 'ta'
                  ? 'நீண்ட நேரம் நீர் தேங்குவதால் ஏற்படும் வேர் அழுகல் மற்றும் இலைக்கருகல் நோயைத் தடுக்கவும்.'
                  : 'Prevent sheath blight and root rot caused by prolonged waterlogging.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
