import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { Sprout, MapPin, Activity, ArrowRight, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

export const Welcome: React.FC = () => {
  const { user, updateOnboardingStatus } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Farmer';

  const handleStartFarm = async () => {
    await updateOnboardingStatus(true, user?.tour_status || 'NOT_STARTED');
    navigate('/farms/new');
  };

  const handleGoDashboard = async () => {
    await updateOnboardingStatus(true, user?.tour_status || 'NOT_STARTED');
    navigate('/dashboard');
  };

  const greetingFallback =
    language === 'ta'
      ? `வணக்கம், ${firstName}! வரவேற்கிறோம்!`
      : `Welcome to CropClimate AI, ${firstName}!`;

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#e5ede8] py-3.5 px-6 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                CropClimate <span className="text-emerald-600">AI</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'ta' ? 'காலநிலை & பயிர் பாதுகாப்பு நுண்ணறிவு' : 'Climate-Smart Crop Intelligence'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle variant="pill" />
            <button
              onClick={handleGoDashboard}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{t('auth.welcome.skip_to_dashboard', 'Skip to Dashboard')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 w-full">
        {/* Banner Hero with High-Contrast Typography */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border border-emerald-800/80 p-8 sm:p-12">
          {/* Subtle Agricultural Landscape Overlay */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
            alt="Farmland background"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-transparent" />

          <div className="relative z-10 space-y-5 max-w-2xl">
            {/* User Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/90 border border-emerald-600/60 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('auth.welcome.badge', 'Welcome Experience')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="normal-case font-semibold text-emerald-300">
                {user?.full_name || 'Farmer'}
              </span>
            </div>

            {/* Main Greeting Heading */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              {t('auth.welcome.greeting', {
                name: firstName,
                defaultValue: greetingFallback,
              })}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-emerald-100 font-medium leading-relaxed">
              {t(
                'auth.welcome.subheading',
                'Your farm-specific climate and crop intelligence journey starts here.'
              )}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-normal">
              {t(
                'auth.welcome.description',
                'Map your farm, add your crop, and understand how upcoming rainfall may affect waterlogging, crop health, survival and recovery.'
              )}
            </p>
          </div>
        </div>

        {/* 3 Steps Guide Section */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('auth.welcome.steps_title', "Let's set up your first farm.")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
              {t(
                'auth.welcome.steps_subtitle',
                'Follow 3 quick steps to initialize your crop-impact analysis.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-white border border-[#e2ece5] rounded-2xl p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors">
                    01
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                  {t('auth.welcome.step1_title', '1. Map Your Farm')}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {t(
                    'auth.welcome.step1_desc',
                    'Locate your farm and draw its boundary on interactive maps.'
                  )}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#eef4f0] flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('auth.welcome.step1_tag', 'Geospatial PostGIS Boundary')}</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white border border-[#e2ece5] rounded-2xl p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors">
                    02
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                  {t('auth.welcome.step2_title', '2. Add Your Crop')}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {t(
                    'auth.welcome.step2_desc',
                    'Tell us what is currently growing and when it was planted.'
                  )}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#eef4f0] flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('auth.welcome.step2_tag', 'Agronomic Growth Stage')}</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white border border-[#e2ece5] rounded-2xl p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors">
                    03
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                  {t('auth.welcome.step3_title', '3. Analyse Rain Impact')}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {t(
                    'auth.welcome.step3_desc',
                    'Understand rainfall, waterlogging and potential crop impact.'
                  )}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#eef4f0] flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('auth.welcome.step3_tag', 'Hybrid ML & Rule Engine')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleStartFarm}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center space-x-2.5 text-sm cursor-pointer hover:scale-[1.02]"
          >
            <span>{t('auth.welcome.add_first_farm', 'Add My First Farm')}</span>
            <ArrowRight className="w-4 h-4 text-emerald-200" />
          </button>
          <button
            onClick={handleGoDashboard}
            className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#e2ece5] hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-colors text-sm cursor-pointer shadow-xs"
          >
            {t('auth.welcome.explore_dashboard', 'Explore Dashboard')}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5ede8] py-5 px-4 text-center text-xs font-medium text-slate-500">
        {t('auth.welcome.footer', '© 2026 CropClimate AI — Climate-Smart Agriculture Platform')}
      </footer>
    </div>
  );
};

export default Welcome;
