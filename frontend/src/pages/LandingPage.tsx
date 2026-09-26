import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';
import {
  Sprout,
  CloudRain,
  Droplets,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Activity,
  Compass,
  Info,
  Wind,
  Thermometer,
  Calendar,
  BarChart3,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(token && user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleHeroCta = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const faqs = language === 'ta' ? [
    {
      q: 'செயலி எதை கணிக்கிறது?',
      a: 'கிடைக்கக்கூடிய பண்ணை, பயிர் மற்றும் வானிலை தகவல்களை அடிப்படையாகக் கொண்டு, நீர் தேக்கம், பயிர் சேதம், உயிர்வாழ்வு மற்றும் மீட்பு சாத்தியம் உள்ளிட்ட மழை தொடர்பான பயிர் பாதிப்பை இது பகுப்பாய்வு செய்கிறது.',
    },
    {
      q: 'சிவப்பு எச்சரிக்கை (Red Alert) என்றால் என் பயிர் சேதமடையும் என்று அர்த்தமா?',
      a: 'இல்லை. அதிகாரப்பூர்வ வானிலை எச்சரிக்கை ஒரு பகுதிக்கான வானிலை தீவிரத்தை விவரிக்கிறது. பயிர் மீதான தாக்கம் பயிர் வகை, வளர்ச்சி நிலை, முந்தைய மழை, மண் நிலை, வடிகால் மற்றும் நீர் தேக்கம் போன்ற காரணிகளையும் சார்ந்துள்ளது.',
    },
    {
      q: 'இந்த செயலி எனது பண்ணையை எவ்வாறு அறிந்துகொள்கிறது?',
      a: 'விவசாயிகள் தங்கள் பண்ணையை ஊடாடும் வரைபடத்தில் கண்டறிந்து பண்ணை எல்லையை வரையலாம். செயலி இந்த இடத்தை பண்ணை சார்ந்த பகுப்பாய்விற்காக பாதுகாப்பாக சேமிக்கிறது.',
    },
    {
      q: 'பயிர் வளர்ச்சி நிலை எவ்வாறு அடையாளம் காணப்படுகிறது?',
      a: 'விதைக்கப்பட்ட தேதி மற்றும் பயிர் காலெண்டரிலிருந்து செயலி வளர்ச்சி நிலையை மதிப்பிடுகிறது, மேலும் அதை மதிப்பாய்வு செய்ய அல்லது திருத்த விவசாயியை அனுமதிக்கிறது.',
    },
    {
      q: 'மண் தகவல் துல்லியமானதா?',
      a: 'மண் தகவல்கள் ஆய்வகத்தில் சரிபார்க்கப்பட்டது, விவசாயியால் சரிபார்க்கப்பட்டது அல்லது மதிப்பிடப்பட்டது என தெளிவாக அடையாளம் காணப்படுகின்றன. மதிப்பிடப்பட்ட தகவல்களை விட சரிபார்க்கப்பட்ட தகவல்களுக்கு முன்னுரிமை அளிக்கப்படுகிறது.',
    },
    {
      q: 'கணிப்புகள் உத்தரவாதமானவையா?',
      a: 'இல்லை. இந்த செயலி ஒரு விவசாய முடிவெடுக்கும் மற்றும் ஆராய்ச்சி அமைப்பாகும். முடிவுகள் கிடைக்கக்கூடிய தரவு மற்றும் மாதிரி அல்லது ஆதார வரம்புகளைப் பொறுத்தது.',
    },
  ] : [
    {
      q: 'What does the system predict?',
      a: 'It analyses rainfall-related crop risk, including waterlogging, crop damage, survival and recovery potential, based on available farm, crop and weather information.',
    },
    {
      q: 'Does a Red Alert mean my crop will be damaged?',
      a: 'No. An official weather warning describes weather severity for an area. Crop impact also depends on factors such as crop type, growth stage, previous rainfall, soil conditions, drainage and waterlogging.',
    },
    {
      q: 'How does the application know my farm?',
      a: 'Farmers can locate their farm on an interactive map and draw the farm boundary. The application stores the location securely for farm-specific analysis.',
    },
    {
      q: 'How is the crop growth stage identified?',
      a: 'The application estimates growth stage from the planting date and crop calendar, and allows the farmer to review or correct the stage.',
    },
    {
      q: 'Is soil information exact?',
      a: 'Soil information is clearly identified as lab verified, farmer verified or estimated. Verified information takes priority over estimated information.',
    },
    {
      q: 'Are the predictions guaranteed?',
      a: 'No. The application is a decision-support and research system. Results depend on available data and model or evidence limitations.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ========================================================= */}
      {/* STICKY NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center text-emerald-400 shadow-inner group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                  CropClimate AI
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {language === 'ta' ? 'ஆராய்ச்சி இயந்திரம்' : 'MSc Research'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </a>
            <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'செயல்படும் முறை' : 'How It Works'}
            </a>
            <a href="#features" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'அம்சங்கள்' : 'Features'}
            </a>
            <a href="#climate-insights" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'காலநிலை பார்வைகள்' : 'Climate Insights'}
            </a>
            <a href="#about" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'பற்றி' : 'About'}
            </a>
            <a href="#faq" className="hover:text-emerald-800 transition-colors">
              {language === 'ta' ? 'கேள்வி-பதில்' : 'FAQ'}
            </a>
          </nav>

          {/* Right Auth CTA Buttons & Language Switcher (Desktop) */}
          <div className="hidden sm:flex items-center space-x-4">
            <LanguageToggle variant="pill" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-900 transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/farms"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center space-x-2"
                >
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span>{t('nav.my_farms')}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-900 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center space-x-2"
                >
                  <span>{t('nav.register')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <div className="py-2 border-b border-slate-100 flex justify-center">
              <LanguageToggle variant="pill" className="w-full justify-center" />
            </div>
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'முகப்பு' : 'Home'}
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'செயல்படும் முறை' : 'How It Works'}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'அம்சங்கள்' : 'Features'}
            </a>
            <a
              href="#climate-insights"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'காலநிலை பார்வைகள்' : 'Climate Insights'}
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'பற்றி' : 'About'}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {language === 'ta' ? 'கேள்வி-பதில்' : 'FAQ'}
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-slate-700 bg-slate-100 rounded-lg"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/farms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-white bg-emerald-900 rounded-lg"
                  >
                    {t('nav.my_farms')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-slate-700 bg-slate-100 rounded-lg"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-white bg-emerald-900 rounded-lg"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SECTION 1 — HERO */}
      {/* ========================================================= */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide">
                <CloudRain className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ta' ? 'பண்ணை அளவிலான தீவிர வானிலை நுண்ணறிவு' : 'Farm-Specific Extreme Weather Intelligence'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {language === 'ta' ? (
                  <>
                    மழையை அறிவோம். <br />
                    <span className="text-emerald-900">பயிரைக் காப்போம்.</span>
                  </>
                ) : (
                  <>
                    Know the Rain. <br />
                    <span className="text-emerald-900">Protect the Crop.</span>
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                {language === 'ta'
                  ? 'தீவிர மழைக்கு முன்னும் பின்னும் பயிர் அபாயத்தைப் புரிந்து கொள்ள வானிலை, பயிர் வளர்ச்சி நிலை, மண் நிலை, வடிகால் மற்றும் இயந்திர கற்றலை ஒருங்கிணைக்கும் நுண்ணறிவு தளம்.'
                  : 'Farm-specific rainfall impact intelligence that combines weather, crop growth stage, soil conditions, drainage and machine learning to help understand crop risk before and after extreme rainfall.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={handleHeroCta}
                  className="px-8 py-4 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 text-base cursor-pointer"
                >
                  <span>{language === 'ta' ? 'என் பண்ணையை பகுப்பாய்வு செய்' : 'Analyse My Farm'}</span>
                  <ArrowRight className="w-5 h-5 text-emerald-300" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-7 py-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-center text-base"
                >
                  {language === 'ta' ? 'செயல்படும் முறையை அறிய' : 'Explore How It Works'}
                </a>
              </div>

              {/* Contextual Pills */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{language === 'ta' ? 'மழையளவு' : 'Rainfall'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'ta' ? 'மண்' : 'Soil'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ta' ? 'பயிர் பருவம்' : 'Crop Stage'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'ta' ? 'நீர் தேக்கம்' : 'Waterlogging'}</span>
                </span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group bg-emerald-950">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                  alt="Aerial Agricultural Field"
                  className="w-full h-[440px] sm:h-[500px] object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>

                {/* Floating Preview Card */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {language === 'ta' ? 'நேரலை மாதிரி முன்னோட்டம்' : 'Live Farm Model Preview'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {language === 'ta' ? 'தஞ்சாவூர் நெல் வயல்' : 'Tanjore Paddy Field'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{language === 'ta' ? '24 மணி நேர மழை அபாயம்' : '24h Rain Risk'}</span>
                      <span className="font-semibold text-emerald-900">{language === 'ta' ? 'குறைந்த அபாயம்' : 'Low Wash Risk'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{language === 'ta' ? 'நீர் தேக்க அபாயம்' : 'Waterlogging'}</span>
                      <span className="font-semibold text-emerald-900">{language === 'ta' ? 'மிதமான அபாயம்' : 'Moderate'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 — WHY THIS PROJECT */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-[#07261c] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">
              MSc Research Context
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              From Weather Warning to Crop Impact
            </h2>
            <p className="text-lg text-emerald-100/90 leading-relaxed font-light">
              A heavy-rain warning tells us that extreme weather may occur. Farmers also need to
              understand what that rainfall could mean for the crop growing on their specific farm.
            </p>
          </div>

          {/* 4 Visual Editorial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 01 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  01
                </span>
                <h3 className="text-xl font-bold text-white mb-3">Farm-Specific Analysis</h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Analyse rainfall in the context of the actual farm location and conditions.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
                <span>Geospatial Boundary</span>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  02
                </span>
                <h3 className="text-xl font-bold text-white mb-3">Crop & Growth Stage</h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Consider crop type, crop age and growth stage instead of treating every crop
                  equally.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <Sprout className="w-4 h-4 mr-2 text-emerald-400" />
                <span>Agronomic Stage Sensitivity</span>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  03
                </span>
                <h3 className="text-xl font-bold text-white mb-3">Waterlogging Intelligence</h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Combine rainfall, previous rainfall, soil wetness and drainage to assess
                  waterlogging risk.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <Droplets className="w-4 h-4 mr-2 text-emerald-400" />
                <span>Soil & Antecedent Moisture</span>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  04
                </span>
                <h3 className="text-xl font-bold text-white mb-3">Recovery Insight</h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Evaluate potential crop survival and recovery after a severe rainfall event.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <RotateCcw className="w-4 h-4 mr-2 text-emerald-400" />
                <span>Post-Event Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 — CORE PROJECT STATEMENT */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-white text-slate-900 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Core Scientific Hypothesis
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            "Rainfall alone does not determine crop damage."
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Our approach combines weather conditions with crop stage, soil, drainage, previous
            rainfall and waterlogging risk to create more meaningful farm-level crop-impact
            analysis.
          </p>

          {/* Visual Factor Flow Diagram */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {[
                { name: 'Rainfall', icon: CloudRain, color: 'text-blue-600' },
                { name: 'Previous Rain', icon: Calendar, color: 'text-indigo-600' },
                { name: 'Crop Stage', icon: Sprout, color: 'text-emerald-600' },
                { name: 'Soil Profile', icon: Layers, color: 'text-amber-700' },
                { name: 'Soil Moisture', icon: Droplets, color: 'text-cyan-600' },
                { name: 'Drainage', icon: Compass, color: 'text-teal-600' },
                { name: 'Waterlogging', icon: Activity, color: 'text-red-600' },
              ].map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center space-y-2 text-center hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                >
                  <factor.icon className={`w-5 h-5 ${factor.color}`} />
                  <span className="text-xs font-semibold text-slate-700">{factor.name}</span>
                </div>
              ))}
            </div>

            {/* Connection Arrow */}
            <div className="flex items-center justify-center space-x-3 text-slate-400 py-2">
              <div className="h-px bg-slate-200 flex-1 max-w-xs"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                INTEGRATED HYBRID ENGINE
              </span>
              <div className="h-px bg-slate-200 flex-1 max-w-xs"></div>
            </div>

            {/* Target Output Box */}
            <div className="mt-4 max-w-md mx-auto bg-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800 flex items-center justify-center space-x-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
                  Scientific Output
                </span>
                <span className="text-xl font-bold tracking-tight">FARM CROP IMPACT ASSESSMENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 — HOW IT WORKS */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              Step-by-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              From Farm Location to Crop Insight
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              A simple workflow converts weather and farm information into understandable risk
              guidance.
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Map Your Farm',
                desc: 'Locate the farm on interactive maps and draw its actual spatial boundary.',
                icon: MapPin,
              },
              {
                step: '2',
                title: 'Add Your Crop',
                desc: 'Select the crop, planting date and current growth stage.',
                icon: Sprout,
              },
              {
                step: '3',
                title: 'Understand Farm Conditions',
                desc: 'Combine soil profile, drainage and recent antecedent weather.',
                icon: Layers,
              },
              {
                step: '4',
                title: 'Analyse Rainfall',
                desc: 'Evaluate forecast rainfall, rainfall intensity and antecedent rainfall.',
                icon: CloudRain,
              },
              {
                step: '5',
                title: 'Assess Crop Impact',
                desc: 'Estimate waterlogging, crop damage, survival and recovery potential.',
                icon: Activity,
              },
              {
                step: '6',
                title: 'Take Action',
                desc: 'Receive understandable explanations and farmer-focused recommendations.',
                icon: ShieldCheck,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-100">
                      <item.icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <span className="text-2xl font-black text-slate-200">0{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — ANALYSIS CAPABILITIES */}
      {/* ========================================================= */}
      <section id="features" className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
                Multi-Dimensional Risk Signals
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                One Analysis. Multiple Crop-Risk Signals.
              </h2>
            </div>
            <span className="mt-4 md:mt-0 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start md:self-auto">
              Decision-Support Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    APPLICATION RAIN RISK
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    24h / 48h Window
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Fertilizer & Spray Wash Risk</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Estimates the likelihood of agricultural sprays or field inputs being washed away by upcoming rain.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Risk Scale</span>
                <span className="text-emerald-800 font-bold">Low • Moderate • High • Extreme</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    WATERLOGGING RISK
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Soil & Drainage
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Root Zone Saturation</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Combines rainfall intensity, antecedent rain, soil texture and farm drainage class.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Risk Scale</span>
                <span className="text-blue-800 font-bold">Low • Moderate • High • Critical</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    CROP DAMAGE RISK
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Hybrid ML Engine
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Physiological Stress</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Understand potential rainfall-related crop stress considering crop age and growth stage.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Severity Level</span>
                <span className="text-amber-800 font-bold">Low • Moderate • High • Severe</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    SURVIVAL POTENTIAL
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Submergence Tolerance
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Plant Survival Likelihood</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Assess the crop's potential to withstand the submergence event without total plant loss.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Potential Level</span>
                <span className="text-emerald-800 font-bold">Low • Medium • High</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    RECOVERY POTENTIAL
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Post-Rain Tracking
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Post-Drainage Rebound</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Understand recovery potential after water drains and field management interventions occur.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Potential Level</span>
                <span className="text-teal-800 font-bold">Low • Medium • High</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    CROP LOSS RISK
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Qualitative Classification
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Qualitative Risk Summary</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Present an understandable qualitative loss-risk classification for overall decision support.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>Loss Level</span>
                <span className="text-rose-800 font-bold">Low • Moderate • High</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — FARM MAP FEATURE */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Interactive Map Preview Visual */}
            <div className="lg:col-span-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xl">
                <div className="h-80 sm:h-96 rounded-xl bg-slate-900 relative overflow-hidden border border-slate-200 flex flex-col justify-between p-4">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>

                  <div className="relative z-10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">PostGIS Polygon Storage</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                      EPSG:4326
                    </span>
                  </div>

                  {/* Polygon Vector Representation */}
                  <div className="relative z-10 my-auto flex items-center justify-center">
                    <div className="relative w-64 h-40 border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                      <span className="text-xs font-semibold text-emerald-300 bg-slate-900/90 px-3 py-1 rounded-md border border-emerald-500/30">
                        Farm Boundary: 4.2 Hectares
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-lg border border-slate-800">
                    <span>Lat: 10.787° N</span>
                    <span>Lon: 79.138° E</span>
                    <span>Thanjavur, TN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Geospatial Precision
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                Every Analysis Starts With the Farm
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Map the actual farm boundary, record crop and drainage conditions, and connect weather
                information to the location that matters.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'GPS-based location resolution',
                  'Interactive polygon farm boundary mapping',
                  'Automatic farm area calculation (acres / hectares)',
                  'PostgreSQL + PostGIS geospatial storage',
                  'Multiple farm support per farmer profile',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to={isAuthenticated ? '/farms/new' : '/register'}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  <span>Add Your Farm</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 — WEATHER & RAINFALL INTELLIGENCE */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-[#092e21] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
              Integrated Weather Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              See More Than Tomorrow's Rain
            </h2>
            <p className="text-emerald-100/90 text-base sm:text-lg leading-relaxed">
              The system considers forecast rainfall together with recent rainfall and available soil
              conditions to understand whether a farm may already be vulnerable before the next event
              begins.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Next 24h Rain', desc: 'Immediate input risk window', icon: CloudRain },
              { label: 'Next 48h Rain', desc: 'Accumulated volume forecast', icon: CloudRain },
              { label: 'Peak Hourly Rain', desc: 'Intensity & erosion indicator', icon: Wind },
              { label: 'Previous 72h Rain', desc: 'Antecedent wetness memory', icon: Calendar },
              { label: 'Continuous Rain', desc: 'Submergence duration indicator', icon: Activity },
              { label: 'Soil Moisture', desc: 'Root zone saturation ratio', icon: Droplets },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-[#0e3f2e] border border-emerald-800/40 rounded-xl p-4 flex flex-col justify-between"
              >
                <card.icon className="w-6 h-6 text-emerald-400 mb-3" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{card.label}</h4>
                  <p className="text-xs text-emerald-200/70">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-xl bg-[#0e3f2e]/60 border border-emerald-800/40 inline-flex items-center space-x-3 text-xs text-emerald-200">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Weather Data Source: Open-Meteo High-Resolution Meteorological API</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8 — EXPLAINABLE INTELLIGENCE */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=800&q=80"
                  alt="Rain over Farm Field"
                  className="w-full h-[420px] object-cover"
                />
              </div>
            </div>

            {/* Right Explanation Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Transparent AI Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Not Just a Risk Level. <br />
                <span className="text-emerald-900">Understand Why.</span>
              </h2>

              {/* Explanation Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    EXAMPLE EXPLANATION SUMMARY
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Hybrid: ML + TNAU Agronomic Rules
                  </span>
                </div>

                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>High rainfall is expected during the next 24 hours.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>Recent rainfall indicates wetter antecedent conditions.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>Soil moisture is elevated.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>Farm drainage is limited.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>The crop's current growth stage may increase sensitivity.</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={handleHeroCta}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <span>Explore Crop Analysis</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9 — CLIMATE CHANGE ANALYSIS */}
      {/* ========================================================= */}
      <section id="climate-insights" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              30-Year Reanalysis Trends
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Understand the Long-Term Climate Context
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Explore historical rainfall, temperature and extreme-rainfall indicators to understand
              how local climate conditions have changed over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: 'Rainfall Trend', desc: 'Linear slope of annual precipitation', icon: TrendingUp },
              { title: 'Temperature Trend', desc: 'Avg & Max annual thermal shift', icon: Thermometer },
              { title: 'Heavy Rain Days', desc: 'Frequency of >10mm & >20mm events', icon: CloudRain },
              { title: 'Extreme Rain Trend', desc: 'Rx1day & Rx5day max daily rainfall', icon: AlertTriangle },
              { title: 'Seasonal Rainfall', desc: 'Monsoon vs non-monsoon shifts', icon: BarChart3 },
            ].map((chart, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                    <chart.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{chart.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{chart.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>30-Year Engine</span>
                  <span className="text-emerald-700">Reanalysis</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to={isAuthenticated ? '/climate-analysis' : '/login'}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-colors"
            >
              <span>Explore Climate Insights</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10 — BEFORE, DURING & AFTER RAIN */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              Agronomic Decision Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Support Across the Rainfall Event
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BEFORE RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-4 inline-block">
                  BEFORE RAIN
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Pre-Event Mitigation</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Prepare field drainage channels to accelerate runoff.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Review application rain risk before spraying or fertilizing.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Avoid unnecessary irrigation where rainfall is imminent.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* DURING RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full mb-4 inline-block">
                  DURING RAIN
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">In-Event Monitoring</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Monitor standing water buildup in low-lying plots.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Track updated hourly rainfall intensity conditions.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Avoid unsafe field operations during heavy downpours.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AFTER RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-4 inline-block">
                  AFTER RAIN
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Post-Event Recovery</h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>Record standing-water duration and drainage rate.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>Assess visible leaf chlorosis and root health condition.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>Update recovery assessment to guide corrective nutrient care.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 11 — POST-RAIN RECOVERY */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Post-Rain Assessment Module
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                What Happens After the Water Drains?
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                The analysis does not stop when the rainfall ends. Farmers can record standing-water
                duration and visible crop condition to update the crop recovery assessment.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">Observation Input</span>
                  <span className="text-sm font-bold text-slate-800">Waterlogging Duration (Hours)</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">Visual Damage</span>
                  <span className="text-sm font-bold text-slate-800">Leaf Silt & Submergence</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h4 className="text-base font-bold text-slate-900">Post-Rain Recovery Pipeline</h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Field-Verified Update
                  </span>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <span className="text-slate-600">Standing Water Duration</span>
                    <span className="text-slate-900 font-bold">Recorded 24-48 Hours</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <span className="text-slate-600">Visible Crop Condition</span>
                    <span className="text-slate-900 font-bold">Mild Leaf Chlorosis</span>
                  </div>
                  <div className="p-3 bg-emerald-900 text-white rounded-lg flex items-center justify-between">
                    <span>Updated Recovery Potential</span>
                    <span className="font-bold text-emerald-300">MEDIUM RECOVERY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 12 — PROJECT CAPABILITIES */}
      {/* ========================================================= */}
      <section className="py-20 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              Truthful Research Scope
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Initial Project Coverage
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">10</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">Crop Categories</span>
              <span className="text-xs text-slate-500">Paddy, Maize, Sugarcane, Cotton & more</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">24h / 48h</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">Analysis Windows</span>
              <span className="text-xs text-slate-500">Short-term extreme rain evaluation</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">3</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">Soil Data Sources</span>
              <span className="text-xs text-slate-500">Lab, Farmer Verified & SoilGrids</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">PostGIS</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">Farm Geospatial Engine</span>
              <span className="text-xs text-slate-500">Spatial polygon boundary storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 13 — TECHNOLOGY / DATA SOURCES */}
      {/* ========================================================= */}
      <section id="about" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              Credibility & Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Built on Open Data and Transparent Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Open-Meteo API',
                desc: 'High-resolution meteorological forecast and 30-year historical climate reanalysis dataset.',
                tag: 'Weather & Climate Source',
              },
              {
                title: 'OpenStreetMap & Leaflet',
                desc: 'Interactive open-source geospatial mapping and farm boundary drawing tools.',
                tag: 'Mapping Infrastructure',
              },
              {
                title: 'PostgreSQL + PostGIS',
                desc: 'Robust spatial database supporting polygon geometry and spatial queries.',
                tag: 'Database & GIS',
              },
              {
                title: 'ICAR / TNAU Data Sources',
                desc: 'Agronomic crop stress profiles, submergence tolerances and crop calendars.',
                tag: 'Agronomic Research',
              },
              {
                title: 'Machine Learning Models',
                desc: 'Random Forest & Gradient Boosting models trained on validated agricultural target datasets.',
                tag: 'ML Architecture',
              },
              {
                title: 'Evidence-Based Rule Engine',
                desc: 'Agronomic rule fallback ensuring transparent, zero-hallucination risk scoring.',
                tag: 'Rule-Based Engine',
              },
            ].map((tech, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  {tech.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{tech.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 14 — FAQ */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              Questions & Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-700 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 15 — FINAL CTA */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#07261c] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Prepare Before the Rain Reaches the Field.
          </h2>

          <p className="text-lg text-emerald-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            Map your farm, add your crop and understand how upcoming rainfall may affect it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-9 py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl shadow-xl transition-all text-base"
            >
              Get Started
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto px-9 py-4 bg-transparent border border-emerald-500/50 hover:bg-emerald-900 text-white font-semibold rounded-xl transition-colors text-base"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="bg-[#051c14] text-slate-300 pt-16 pb-12 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-300">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">CropClimate AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                An MSc research project exploring farm-specific crop impact analysis under extreme rainfall
                and changing climate conditions.
              </p>
            </div>

            {/* Project Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">PROJECT</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#climate-insights" className="hover:text-white transition-colors">Climate Analysis</a></li>
              </ul>
            </div>

            {/* Application Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">APPLICATION</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to={isAuthenticated ? "/dashboard" : "/login"} className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to={isAuthenticated ? "/farms" : "/login"} className="hover:text-white transition-colors">My Farms</Link></li>
              </ul>
            </div>

            {/* Research & Legal Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">RESEARCH & LEGAL</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition-colors">Methodology</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Data Sources</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Model Information</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Project Limitations</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 CropClimate AI — MSc Research Project</p>
            <p className="mt-2 sm:mt-0">Decision-Support Architecture for Extreme Weather Events</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
