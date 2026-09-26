import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { Sprout, MapPin, Activity, ArrowRight, Layers } from 'lucide-react';

export const Welcome: React.FC = () => {
  const { user, updateOnboardingStatus } = useAuth();
  const { t } = useLanguage();
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CropClimate AI</span>
              <p className="text-xs text-slate-500 font-medium">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle variant="pill" />
            <button
              onClick={handleGoDashboard}
              className="text-sm font-semibold text-slate-600 hover:text-emerald-900 transition-colors"
            >
              {t('auth.welcome.skip_to_dashboard', 'Skip to Dashboard')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        {/* Banner Hero */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-emerald-950 text-white border border-emerald-900 p-8 sm:p-12">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
            alt="Agricultural Field"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="relative z-10 space-y-6 max-w-3xl">
            <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>{t('auth.welcome.badge', 'Welcome Experience')}</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t('auth.welcome.greeting', { name: firstName })}
            </h1>

            <p className="text-lg sm:text-xl text-emerald-100 font-normal leading-relaxed">
              {t('auth.welcome.subheading', 'Your farm-specific climate and crop intelligence journey starts here.')}
            </p>

            <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed font-light">
              {t('auth.welcome.description', 'Map your farm, add your crop, and understand how upcoming rainfall may affect waterlogging, crop health, survival and recovery.')}
            </p>
          </div>
        </div>

        {/* Quick Start 3 Steps */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.welcome.steps_title', "Let's set up your first farm.")}</h2>
            <p className="text-sm text-slate-600">{t('auth.welcome.steps_subtitle', 'Follow 3 quick steps to initialize your crop-impact analysis.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-emerald-700" />
                  </div>
                  <span className="text-xl font-black text-slate-200">01</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('auth.welcome.step1_title', '1. Map Your Farm')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('auth.welcome.step1_desc', 'Locate your farm and draw its boundary on interactive maps.')}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800">
                {t('auth.welcome.step1_tag', 'Geospatial PostGIS Boundary')}
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5 text-emerald-700" />
                  </div>
                  <span className="text-xl font-black text-slate-200">02</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('auth.welcome.step2_title', '2. Add Your Crop')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('auth.welcome.step2_desc', 'Tell us what is currently growing and when it was planted.')}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800">
                {t('auth.welcome.step2_tag', 'Agronomic Growth Stage')}
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5 text-emerald-700" />
                  </div>
                  <span className="text-xl font-black text-slate-200">03</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('auth.welcome.step3_title', '3. Analyse Rain Impact')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('auth.welcome.step3_desc', 'Understand rainfall, waterlogging and potential crop impact.')}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-800">
                {t('auth.welcome.step3_tag', 'Hybrid ML & Rule Engine')}
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            onClick={handleStartFarm}
            className="w-full sm:w-auto px-9 py-4 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 text-base cursor-pointer"
          >
            <span>{t('auth.welcome.add_first_farm', 'Add My First Farm')}</span>
            <ArrowRight className="w-5 h-5 text-emerald-300" />
          </button>
          <button
            onClick={handleGoDashboard}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors text-base cursor-pointer"
          >
            {t('auth.welcome.explore_dashboard', 'Explore Dashboard')}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        {t('auth.welcome.footer', '© 2026 CropClimate AI — Decision-Support Research System')}
      </footer>
    </div>
  );
};

export default Welcome;
