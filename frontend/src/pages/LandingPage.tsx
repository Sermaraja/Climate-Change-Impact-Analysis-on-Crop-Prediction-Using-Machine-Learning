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

  const isTa = language === 'ta';

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

  const faqs = isTa ? [
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
      a: 'இல்லை. இந்த செயலி ஒரு விவசாய முடிவெடுக்கும் அமைப்பாகும். முடிவுகள் கிடைக்கக்கூடிய தரவு மற்றும் மாதிரி அல்லது ஆதார வரம்புகளைப் பொறுத்தது.',
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
      a: 'No. The application is a decision-support system. Results depend on available data and model or evidence limitations.',
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
                  {isTa ? 'வேளாண் AI தளம்' : 'Agronomic AI'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {isTa ? 'காலநிலை & பயிர் பாதுகாப்பு நுண்ணறிவு' : t('tagline')}
              </p>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#hero" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'முகப்பு' : 'Home'}
            </a>
            <a href="#how-it-works" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'செயல்படும் முறை' : 'How It Works'}
            </a>
            <a href="#features" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'அம்சங்கள்' : 'Features'}
            </a>
            <a href="#climate-insights" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'காலநிலை பார்வைகள்' : 'Climate Insights'}
            </a>
            <a href="#about" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'பற்றி' : 'About'}
            </a>
            <a href="#faq" className="hover:text-emerald-800 transition-colors">
              {isTa ? 'கேள்வி-பதில்' : 'FAQ'}
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center space-x-4">
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg shadow-sm transition-all"
                >
                  {t('nav.my_farms')}
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
              {isTa ? 'முகப்பு' : 'Home'}
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {isTa ? 'செயல்படும் முறை' : 'How It Works'}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {isTa ? 'அம்சங்கள்' : 'Features'}
            </a>
            <a
              href="#climate-insights"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {isTa ? 'காலநிலை பார்வைகள்' : 'Climate Insights'}
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {isTa ? 'பற்றி' : 'About'}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-900"
            >
              {isTa ? 'கேள்வி-பதில்' : 'FAQ'}
            </a>

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-slate-800 bg-slate-100 rounded-lg"
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
                <span>{isTa ? 'பண்ணை அளவிலான தீவிர வானிலை நுண்ணறிவு' : 'Farm-Specific Extreme Weather Intelligence'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {isTa ? (
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
                {isTa
                  ? 'தீவிர மழைக்கு முன்னும் பின்னும் பயிர் அபாயத்தைப் புரிந்து கொள்ள வானிலை, பயிர் வளர்ச்சி நிலை, மண் நிலை, வடிகால் மற்றும் இயந்திர கற்றலை ஒருங்கிணைக்கும் நுண்ணறிவு தளம்.'
                  : 'Farm-specific rainfall impact intelligence that combines weather, crop growth stage, soil conditions, drainage and machine learning to help understand crop risk before and after extreme rainfall.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={handleHeroCta}
                  className="px-8 py-4 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 text-base cursor-pointer"
                >
                  <span>{isTa ? 'என் பண்ணையை பகுப்பாய்வு செய்' : 'Analyse My Farm'}</span>
                  <ArrowRight className="w-5 h-5 text-emerald-300" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-7 py-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-center text-base"
                >
                  {isTa ? 'செயல்படும் முறையை அறிய' : 'Explore How It Works'}
                </a>
              </div>

              {/* Contextual Pills */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isTa ? 'மழையளவு' : 'Rainfall'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isTa ? 'மண்' : 'Soil'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTa ? 'பயிர் பருவம்' : 'Crop Stage'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center space-x-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isTa ? 'நீர் தேக்கம்' : 'Waterlogging'}</span>
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
                        {isTa ? 'நேரலை மாதிரி முன்னோட்டம்' : 'Live Farm Model Preview'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {isTa ? 'தஞ்சாவூர் நெல் வயல்' : 'Tanjore Paddy Field'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isTa ? '24 மணி நேர மழை அபாயம்' : '24h Rain Risk'}</span>
                      <span className="font-semibold text-emerald-900">{isTa ? 'குறைந்த அபாயம்' : 'Low Wash Risk'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isTa ? 'நீர் தேக்க அபாயம்' : 'Waterlogging'}</span>
                      <span className="font-semibold text-emerald-900">{isTa ? 'மிதமான அபாயம்' : 'Moderate'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 — WHY THIS PLATFORM */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-[#07261c] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">
              {isTa ? 'வேளாண் நுண்ணறிவு பின்னணி' : 'Agricultural Intelligence Context'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              {isTa ? 'வானிலை எச்சரிக்கையிலிருந்து பயிர் பாதிப்பிற்கு' : 'From Weather Warning to Crop Impact'}
            </h2>
            <p className="text-lg text-emerald-100/90 leading-relaxed font-light">
              {isTa
                ? 'கனமழை எச்சரிக்கை தீவிர வானிலை நிகழக்கூடும் என்பதை மட்டுமே கூறுகிறது. ஆனால் தங்கள் பண்ணையில் வளரும் பயிருக்கு அந்த மழை என்ன பாதிப்பை ஏற்படுத்தும் என்பதை விவசாயிகள் துல்லியமாக அறிய வேண்டும்.'
                : 'A heavy-rain warning tells us that extreme weather may occur. Farmers also need to understand what that rainfall could mean for the crop growing on their specific farm.'}
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
                <h3 className="text-xl font-bold text-white mb-3">
                  {isTa ? 'பண்ணை சார்ந்த பகுப்பாய்வு' : 'Farm-Specific Analysis'}
                </h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  {isTa
                    ? 'உண்மையான பண்ணை அமைவிடம் மற்றும் உள்ளூர் சூழல்களின் அடிப்படையில் மழையைப் பகுப்பாய்வு செய்தல்.'
                    : 'Analyse rainfall in the context of the actual farm location and conditions.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
                <span>{isTa ? 'புவியியல் எல்லை' : 'Geospatial Boundary'}</span>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  02
                </span>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isTa ? 'பயிர் & வளர்ச்சி நிலை' : 'Crop & Growth Stage'}
                </h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  {isTa
                    ? 'எல்லா பயிர்களையும் ஒன்றாகக் கருதாமல், பயிர் வகை, பயிர் வயது மற்றும் வளர்ச்சி நிலையை கணக்கில் கொள்ளுதல்.'
                    : 'Consider crop type, crop age and growth stage instead of treating every crop equally.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <Sprout className="w-4 h-4 mr-2 text-emerald-400" />
                <span>{isTa ? 'பருவ வளர்ச்சி உணர்திறன்' : 'Agronomic Stage Sensitivity'}</span>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  03
                </span>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isTa ? 'நீர் தேக்க நுண்ணறிவு' : 'Waterlogging Intelligence'}
                </h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  {isTa
                    ? 'மழையளவு, முந்தைய மழை, மண் ஈரப்பதம் மற்றும் வடிகால் ஆகியவற்றை இணைத்து நீர் தேக்க அபாயத்தை மதிப்பிடுதல்.'
                    : 'Combine rainfall, previous rainfall, soil wetness and drainage to assess waterlogging risk.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <Droplets className="w-4 h-4 mr-2 text-emerald-400" />
                <span>{isTa ? 'மண் & முந்தைய ஈரப்பதம்' : 'Soil & Antecedent Moisture'}</span>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-[#0c3829] border border-emerald-800/40 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <span className="text-3xl font-extrabold text-emerald-400/60 block mb-4 group-hover:text-emerald-300 transition-colors">
                  04
                </span>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isTa ? 'மீட்பு வழிகாட்டல்' : 'Recovery Insight'}
                </h3>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  {isTa
                    ? 'கனமழை நிகழ்விற்குப் பிறகு சாத்தியமான பயிர் உயிர்வாழ்வு மற்றும் மீட்பு திறனை மதிப்பாய்வு செய்தல்.'
                    : 'Evaluate potential crop survival and recovery after a severe rainfall event.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-300">
                <RotateCcw className="w-4 h-4 mr-2 text-emerald-400" />
                <span>{isTa ? 'நிகழ்வுக்குப் பிந்தைய மதிப்பீடு' : 'Post-Event Assessment'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 — CORE SCIENTIFIC PRINCIPLE */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 bg-white text-slate-900 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isTa ? 'அடிப்படைக் கோட்பாடு' : 'Core Scientific Principle'}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {isTa ? '"மழையளவு மட்டுமே பயிர் சேதத்தைத் தீர்மானிப்பதில்லை."' : '"Rainfall alone does not determine crop damage."'}
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            {isTa
              ? 'எங்கள் அணுகுமுறை வானிலை நிலைமைகளுடன் பயிர் வளர்ச்சி நிலை, மண் வகை, வடிகால், முந்தைய மழை மற்றும் நீர் தேக்க அபாயத்தை ஒருங்கிணைத்து மிகவும் பயனுள்ள பண்ணை அளவிலான பயிர் பாதிப்பு பகுப்பாய்வை உருவாக்குகிறது.'
              : 'Our approach combines weather conditions with crop stage, soil, drainage, previous rainfall and waterlogging risk to create more meaningful farm-level crop-impact analysis.'}
          </p>

          {/* Visual Factor Flow Diagram */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {[
                { name: isTa ? 'மழையளவு' : 'Rainfall', icon: CloudRain, color: 'text-blue-600' },
                { name: isTa ? 'முந்தைய மழை' : 'Previous Rain', icon: Calendar, color: 'text-indigo-600' },
                { name: isTa ? 'பயிர் பருவம்' : 'Crop Stage', icon: Sprout, color: 'text-emerald-600' },
                { name: isTa ? 'மண் விவரம்' : 'Soil Profile', icon: Layers, color: 'text-amber-700' },
                { name: isTa ? 'மண் ஈரப்பதம்' : 'Soil Moisture', icon: Droplets, color: 'text-cyan-600' },
                { name: isTa ? 'வடிகால்' : 'Drainage', icon: Compass, color: 'text-teal-600' },
                { name: isTa ? 'நீர் தேக்கம்' : 'Waterlogging', icon: Activity, color: 'text-red-600' },
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
                {isTa ? 'ஒருங்கிணைந்த கலப்பின இயந்திரம்' : 'INTEGRATED HYBRID ENGINE'}
              </span>
              <div className="h-px bg-slate-200 flex-1 max-w-xs"></div>
            </div>

            {/* Target Output Box */}
            <div className="mt-4 max-w-md mx-auto bg-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800 flex items-center justify-center space-x-4">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
                  {isTa ? 'அறிவியல் வெளியீடு' : 'Scientific Output'}
                </span>
                <span className="text-xl font-bold tracking-tight">
                  {isTa ? 'பண்ணை பயிர் பாதிப்பு மதிப்பீடு' : 'FARM CROP IMPACT ASSESSMENT'}
                </span>
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
              {isTa ? 'படிநிலைப் பணிப்பாய்வு' : 'Step-by-Step Workflow'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              {isTa ? 'பண்ணை அமைவிடத்திலிருந்து பயிர் நுண்ணறிவு வரை' : 'From Farm Location to Crop Insight'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {isTa
                ? 'வானிலை மற்றும் பண்ணை தகவல்களை எளிதில் புரிந்து கொள்ளக்கூடிய அபாய வழிகாட்டுதலாக மாற்றும் எளிய வழிமுறை.'
                : 'A simple workflow converts weather and farm information into understandable risk guidance.'}
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: isTa ? 'பண்ணையை வரைபடத்தில் குறிக்க' : 'Map Your Farm',
                desc: isTa ? 'ஊடாடும் வரைபடத்தில் பண்ணையைக் கண்டறிந்து உண்மையான எல்லையை வரையவும்.' : 'Locate the farm on interactive maps and draw its actual spatial boundary.',
                icon: MapPin,
              },
              {
                step: '2',
                title: isTa ? 'பயிரைச் சேர்க்கவும்' : 'Add Your Crop',
                desc: isTa ? 'பயிர் வகை, விதைக்கப்பட்ட தேதி மற்றும் தற்போதைய வளர்ச்சி நிலையைத் தேர்ந்தெடுக்கவும்.' : 'Select the crop, planting date and current growth stage.',
                icon: Sprout,
              },
              {
                step: '3',
                title: isTa ? 'பண்ணை நிலையைப் புரிந்து கொள்ள' : 'Understand Farm Conditions',
                desc: isTa ? 'மண் வகை, வடிகால் வசதி மற்றும் சமீபத்திய முந்தைய வானிலையை இணைக்கவும்.' : 'Combine soil profile, drainage and recent antecedent weather.',
                icon: Layers,
              },
              {
                step: '4',
                title: isTa ? 'மழையைப் பகுப்பாய்வு செய்ய' : 'Analyse Rainfall',
                desc: isTa ? 'முன்னறிவிப்பு மழை, மழை தீவிரம் மற்றும் முந்தைய மழையளவை மதிப்பீடு செய்யவும்.' : 'Evaluate forecast rainfall, rainfall intensity and antecedent rainfall.',
                icon: CloudRain,
              },
              {
                step: '5',
                title: isTa ? 'பயிர் பாதிப்பை கணிக்க' : 'Assess Crop Impact',
                desc: isTa ? 'நீர் தேக்கம், பயிர் சேதம், உயிர்வாழ்வு மற்றும் மீட்பு சாத்தியத்தை மதிப்பிடவும்.' : 'Estimate waterlogging, crop damage, survival and recovery potential.',
                icon: Activity,
              },
              {
                step: '6',
                title: isTa ? 'நடவடிக்கை எடுக்க' : 'Take Action',
                desc: isTa ? 'எளிதில் புரியும் விளக்கங்கள் மற்றும் விவசாயிகளுக்கான ஆலோசனைகளைப் பெறவும்.' : 'Receive understandable explanations and farmer-focused recommendations.',
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
                {isTa ? 'பல்நோக்கு அபாய சிக்னல்கள்' : 'Multi-Dimensional Risk Signals'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {isTa ? 'ஒரு பகுப்பாய்வு. பல பயிர் அபாய சிக்னல்கள்.' : 'One Analysis. Multiple Crop-Risk Signals.'}
              </h2>
            </div>
            <span className="mt-4 md:mt-0 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start md:self-auto">
              {isTa ? 'முடிவு ஆதரவு இயந்திரம்' : 'Decision-Support Engine'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {isTa ? 'உள்ளீட்டு மழை அபாயம்' : 'APPLICATION RAIN RISK'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? '24 மணி / 48 மணி சாளரம்' : '24h / 48h Window'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'உரங்கள் & மருந்து கரைசல் அபாயம்' : 'Fertilizer & Spray Wash Risk'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'வரவிருக்கும் மழையால் தெளிக்கப்பட்ட மருந்துகள் அல்லது வயல் உரங்கள் அடித்துச் செல்லப்படும் அபாயத்தை மதிப்பிடுகிறது.'
                    : 'Estimates the likelihood of agricultural sprays or field inputs being washed away by upcoming rain.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'அபாய அளவு' : 'Risk Scale'}</span>
                <span className="text-emerald-800 font-bold">
                  {isTa ? 'குறைவு • மிதம் • அதிகம் • தீவிர' : 'Low • Moderate • High • Extreme'}
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    {isTa ? 'நீர் தேக்க அபாயம்' : 'WATERLOGGING RISK'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? 'மண் & வடிகால்' : 'Soil & Drainage'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'வேர் மண்டல நீர் செறிவு' : 'Root Zone Saturation'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'மழை தீவிரம், முந்தைய மழை, மண் அமைப்பு மற்றும் பண்ணை வடிகால் வகுப்பை ஒருங்கிணைக்கிறது.'
                    : 'Combines rainfall intensity, antecedent rain, soil texture and farm drainage class.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'அபாய அளவு' : 'Risk Scale'}</span>
                <span className="text-blue-800 font-bold">
                  {isTa ? 'குறைவு • மிதம் • அதிகம் • கவலைக்கிடம்' : 'Low • Moderate • High • Critical'}
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    {isTa ? 'பயிர் சேத அபாயம்' : 'CROP DAMAGE RISK'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? 'கலப்பின ML இயந்திரம்' : 'Hybrid ML Engine'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'உயிரியல் அழுத்த பாதிப்பு' : 'Physiological Stress'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'பயிர் வயது மற்றும் வளர்ச்சி நிலையை கணக்கில் கொண்டு மழை தொடர்பான பயிர் அழுத்தத்தைப் புரிந்து கொள்ளுதல்.'
                    : 'Understand potential rainfall-related crop stress considering crop age and growth stage.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'தீவிர நிலை' : 'Severity Level'}</span>
                <span className="text-amber-800 font-bold">
                  {isTa ? 'குறைவு • மிதம் • அதிகம் • கடுமையான' : 'Low • Moderate • High • Severe'}
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {isTa ? 'உயிர்வாழ்வு சாத்தியம்' : 'SURVIVAL POTENTIAL'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? 'நீரில் மூழ்குதல் தாங்குதிறன்' : 'Submergence Tolerance'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'செடி உயிர்வாழும் சாத்தியம்' : 'Plant Survival Likelihood'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'முழுமையான பயிர் இழப்பு ஏற்படாமல் வெள்ள நீரில் மூழ்குவதை பயிர் தாங்கும் திறனை மதிப்பிடுதல்.'
                    : 'Assess the crop\'s potential to withstand the submergence event without total plant loss.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'சாத்திய நிலை' : 'Potential Level'}</span>
                <span className="text-emerald-800 font-bold">
                  {isTa ? 'குறைவு • நடுத்தரம் • அதிகம்' : 'Low • Medium • High'}
                </span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    {isTa ? 'மீட்பு சாத்தியம்' : 'RECOVERY POTENTIAL'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? 'மழைக்கு பிந்தைய கண்காணிப்பு' : 'Post-Rain Tracking'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'வடிகாலுக்குப் பிந்தைய மீட்சி' : 'Post-Drainage Rebound'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'தண்ணீர் வடிந்த பிறகும் வயல் மேலாண்மை நடவடிக்கைகளுக்குப் பிறகும் பயிர் மீண்டு வரும் சாத்தியத்தைப் புரிந்து கொள்ளுதல்.'
                    : 'Understand recovery potential after water drains and field management interventions occur.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'சாத்திய நிலை' : 'Potential Level'}</span>
                <span className="text-teal-800 font-bold">
                  {isTa ? 'குறைவு • நடுத்தரம் • அதிகம்' : 'Low • Medium • High'}
                </span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    {isTa ? 'பயிர் இழப்பு அபாயம்' : 'CROP LOSS RISK'}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {isTa ? 'தரநிலைப் பகுப்பாய்வு' : 'Qualitative Classification'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isTa ? 'ஒட்டுமொத்த இழப்பு அபாயச் சுருக்கம்' : 'Qualitative Risk Summary'}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {isTa
                    ? 'ஒட்டுமொத்த விவசாய முடிவுகளுக்கு உதவ எளிதில் புரிந்து கொள்ளக்கூடிய இழப்பு அபாய நிலையை வழங்குதல்.'
                    : 'Present an understandable qualitative loss-risk classification for overall decision support.'}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
                <span>{isTa ? 'இழப்பு நிலை' : 'Loss Level'}</span>
                <span className="text-rose-800 font-bold">
                  {isTa ? 'குறைவு • மிதம் • அதிகம்' : 'Low • Moderate • High'}
                </span>
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
                      <span className="text-xs font-bold text-slate-200">
                        {isTa ? 'PostGIS பலகோண எல்லை சேமிப்பு' : 'PostGIS Polygon Storage'}
                      </span>
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
                        {isTa ? 'பண்ணை எல்லை: 4.2 ஹெக்டேர்' : 'Farm Boundary: 4.2 Hectares'}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-lg border border-slate-800">
                    <span>Lat: 10.787° N</span>
                    <span>Lon: 79.138° E</span>
                    <span>{isTa ? 'தஞ்சாவூர், தமிழ்நாடு' : 'Thanjavur, TN'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Copy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {isTa ? 'துல்லிய புவியியல்' : 'Geospatial Precision'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {isTa ? 'ஒவ்வொரு பகுப்பாய்வும் உங்கள் பண்ணையிலிருந்து தொடங்குகிறது' : 'Every Analysis Starts With the Farm'}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                {isTa
                  ? 'உண்மையான பண்ணை எல்லையைக் குறிக்கவும், பயிர் மற்றும் வடிகால் நிலைகளைப் பதிவு செய்யவும், முக்கியமான அமைவிடத்துடன் வானிலையை இணைக்கவும்.'
                  : 'Map the actual farm boundary, record crop and drainage conditions, and connect weather information to the location that matters.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  isTa ? 'GPS அடிப்படையிலான துல்லிய அமைவிடம்' : 'GPS-based location resolution',
                  isTa ? 'ஊடாடும் பலகோண பண்ணை எல்லை வரைபடம்' : 'Interactive polygon farm boundary mapping',
                  isTa ? 'தானியங்கி பண்ணை பரப்பளவு கணக்கீடு (ஏக்கர் / ஹெக்டேர்)' : 'Automatic farm area calculation (acres / hectares)',
                  isTa ? 'PostgreSQL + PostGIS புவியியல் தரவுத்தள சேமிப்பு' : 'PostgreSQL + PostGIS geospatial storage',
                  isTa ? 'ஒரு விவசாயி பல பண்ணைகளை நிர்வகிக்கும் வசதி' : 'Multiple farm support per farmer profile',
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
                  <span>{isTa ? 'உங்கள் பண்ணையைச் சேர்க்க' : 'Add Your Farm'}</span>
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
              {isTa ? 'ஒருங்கிணைந்த வானிலை இயந்திரம்' : 'Integrated Weather Engine'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              {isTa ? 'நாளைய மழையைத் தாண்டி முன்கூட்டியே அறியுங்கள்' : "See More Than Tomorrow's Rain"}
            </h2>
            <p className="text-emerald-100/90 text-base sm:text-lg leading-relaxed">
              {isTa
                ? 'அடுத்த மழை நிகழ்வு தொடங்குவதற்கு முன்பே உங்கள் பண்ணை ஏற்கனவே பாதிக்கப்படக்கூடிய நிலையில் உள்ளதா என்பதை அறிய முன்னறிவிப்பு மழை, முந்தைய மழை மற்றும் மண் ஈரப்பதத்தை இந்த அமைப்பு ஒருங்கிணைக்கிறது.'
                : 'The system considers forecast rainfall together with recent rainfall and available soil conditions to understand whether a farm may already be vulnerable before the next event begins.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: isTa ? 'அடுத்த 24 மணி மழை' : 'Next 24h Rain',
                desc: isTa ? 'உடனடி உள்ளீட்டு அபாய சாளரம்' : 'Immediate input risk window',
                icon: CloudRain
              },
              {
                label: isTa ? 'அடுத்த 48 மணி மழை' : 'Next 48h Rain',
                desc: isTa ? 'மொத்த மழை அளவு முன்னறிவிப்பு' : 'Accumulated volume forecast',
                icon: CloudRain
              },
              {
                label: isTa ? 'உச்ச மணிநேர மழை' : 'Peak Hourly Rain',
                desc: isTa ? 'மழை தீவிரம் & மண் அரிப்பு குறியீடு' : 'Intensity & erosion indicator',
                icon: Wind
              },
              {
                label: isTa ? 'முந்தைய 72 மணி மழை' : 'Previous 72h Rain',
                desc: isTa ? 'முந்தைய ஈரப்பத நினைவகம்' : 'Antecedent wetness memory',
                icon: Calendar
              },
              {
                label: isTa ? 'தொடர் மழை' : 'Continuous Rain',
                desc: isTa ? 'வெள்ள நீரில் மூழ்குதல் கால அளவு' : 'Submergence duration indicator',
                icon: Activity
              },
              {
                label: isTa ? 'மண் ஈரப்பதம்' : 'Soil Moisture',
                desc: isTa ? 'வேர் மண்டல நீர் செறிவு விகிதம்' : 'Root zone saturation ratio',
                icon: Droplets
              },
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
            <span>
              {isTa
                ? 'வானிலை தரவு ஆதாரம்: Open-Meteo உயர் தெளிவுத்திறன் வானிலை API'
                : 'Weather Data Source: Open-Meteo High-Resolution Meteorological API'}
            </span>
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
                {isTa ? 'வெளிப்படையான AI கட்டமைப்பு' : 'Transparent AI Architecture'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {isTa ? (
                  <>
                    வெறும் அபாய நிலை மட்டுமல்ல. <br />
                    <span className="text-emerald-900">ஏன் என்று புரிந்து கொள்ளுங்கள்.</span>
                  </>
                ) : (
                  <>
                    Not Just a Risk Level. <br />
                    <span className="text-emerald-900">Understand Why.</span>
                  </>
                )}
              </h2>

              {/* Explanation Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    {isTa ? 'மாதிரி விளக்கச் சுருக்கம்' : 'EXAMPLE EXPLANATION SUMMARY'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {isTa ? 'கலப்பினம்: ML + TNAU வேளாண் விதிகள்' : 'Hybrid: ML + TNAU Agronomic Rules'}
                  </span>
                </div>

                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>
                      {isTa
                        ? 'அடுத்த 24 மணி நேரத்தில் அதிக மழை எதிர்பார்க்கப்படுகிறது.'
                        : 'High rainfall is expected during the next 24 hours.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>
                      {isTa
                        ? 'சமீபத்திய மழை முந்தைய ஈரப்பத நிலையைக் குறிக்கிறது.'
                        : 'Recent rainfall indicates wetter antecedent conditions.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>
                      {isTa ? 'மண் ஈரப்பதம் அதிகரித்துள்ளது.' : 'Soil moisture is elevated.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>
                      {isTa ? 'பண்ணை வடிகால் வசதி குறைவாக உள்ளது.' : 'Farm drainage is limited.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
                    <span>
                      {isTa
                        ? 'பயிரின் தற்போதைய வளர்ச்சி நிலை பாதிப்பு உணர்திறனை அதிகரிக்கக்கூடும்.'
                        : "The crop's current growth stage may increase sensitivity."}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  onClick={handleHeroCta}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <span>{isTa ? 'பயிர் பகுப்பாய்வை அறிய' : 'Explore Crop Analysis'}</span>
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
              {isTa ? '30 ஆண்டு வரலாற்றுப் போக்குகள்' : '30-Year Reanalysis Trends'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              {isTa ? 'நீண்ட கால காலநிலை சூழலைப் புரிந்து கொள்ளுங்கள்' : 'Understand the Long-Term Climate Context'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {isTa
                ? 'உள்ளூர் காலநிலை நிலைமைகள் காலப்போக்கில் எவ்வாறு மாறியுள்ளன என்பதைப் புரிந்து கொள்ள வரலாற்று மழை, வெப்பநிலை மற்றும் தீவிர மழை குறிகாட்டிகளை ஆராயுங்கள்.'
                : 'Explore historical rainfall, temperature and extreme-rainfall indicators to understand how local climate conditions have changed over time.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                title: isTa ? 'மழைப்பொழிவு போக்கு' : 'Rainfall Trend',
                desc: isTa ? 'ஆண்டு மழையளவின் நேரியல் சாய்வு' : 'Linear slope of annual precipitation',
                icon: TrendingUp
              },
              {
                title: isTa ? 'வெப்பநிலை போக்கு' : 'Temperature Trend',
                desc: isTa ? 'சராசரி & அதிகபட்ச ஆண்டு வெப்ப மாற்றம்' : 'Avg & Max annual thermal shift',
                icon: Thermometer
              },
              {
                title: isTa ? 'கனமழை நாட்கள்' : 'Heavy Rain Days',
                desc: isTa ? '>10மிமீ & >20மிமீ நிகழ்வுகளின் எண்ணிக்கை' : 'Frequency of >10mm & >20mm events',
                icon: CloudRain
              },
              {
                title: isTa ? 'தீவிர மழை போக்கு' : 'Extreme Rain Trend',
                desc: isTa ? 'Rx1day & Rx5day அதிகபட்ச தினசரி மழை' : 'Rx1day & Rx5day max daily rainfall',
                icon: AlertTriangle
              },
              {
                title: isTa ? 'பருவமழை அளவு' : 'Seasonal Rainfall',
                desc: isTa ? 'பருவமழை vs பருவமற்ற மழை மாற்றங்கள்' : 'Monsoon vs non-monsoon shifts',
                icon: BarChart3
              },
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
                  <span>{isTa ? '30 ஆண்டு இயந்திரம்' : '30-Year Engine'}</span>
                  <span className="text-emerald-700">{isTa ? 'மறுபகுப்பாய்வு' : 'Reanalysis'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to={isAuthenticated ? '/climate-analysis' : '/login'}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-xl transition-colors"
            >
              <span>{isTa ? 'காலநிலை பார்வைகளை அறிய' : 'Explore Climate Insights'}</span>
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
              {isTa ? 'வேளாண் முடிவு ஆதரவு' : 'Agronomic Decision Support'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {isTa ? 'மழை நிகழ்வின் ஒவ்வொரு கட்டத்திலும் முழு வழிகாட்டல்' : 'Support Across the Rainfall Event'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BEFORE RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-4 inline-block">
                  {isTa ? 'மழைக்கு முன்' : 'BEFORE RAIN'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {isTa ? 'முன்னெச்சரிக்கை தணிப்பு' : 'Pre-Event Mitigation'}
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'மழைநீர் விரைவாக வெளியேற வடிகால் வாய்க்கால்களை தூர்வாரவும்.'
                        : 'Prepare field drainage channels to accelerate runoff.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'உரமிடல் அல்லது பூச்சிக்கொல்லி தெளிப்பதற்கு முன் உள்ளீட்டு மழை அபாயத்தை சரிபார்க்கவும்.'
                        : 'Review application rain risk before spraying or fertilizing.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'மழை பெய்ய வாய்ப்புள்ளதால் தேவையற்ற பாசனத்தைத் தவிர்க்கவும்.'
                        : 'Avoid unnecessary irrigation where rainfall is imminent.'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* DURING RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full mb-4 inline-block">
                  {isTa ? 'மழையின் போது' : 'DURING RAIN'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {isTa ? 'நிகழ்வின் போது கண்காணிப்பு' : 'In-Event Monitoring'}
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'பள்ளமான பகுதிகளில் நீர் தேங்குவதைக் கண்காணிக்கவும்.'
                        : 'Monitor standing water buildup in low-lying plots.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'புதுப்பிக்கப்பட்ட மணிநேர மழை தீவிரத்தைக் கண்காணிக்கவும்.'
                        : 'Track updated hourly rainfall intensity conditions.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'கனமழையின் போது பாதுகாப்பற்ற வயல் பணிகளைத் தவிர்க்கவும்.'
                        : 'Avoid unsafe field operations during heavy downpours.'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AFTER RAIN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-4 inline-block">
                  {isTa ? 'மழைக்கு பின்' : 'AFTER RAIN'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {isTa ? 'நிகழ்வுக்குப் பிந்தைய மீட்பு' : 'Post-Event Recovery'}
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'தேங்கிய நீரின் கால அளவு மற்றும் வடிகால் வேகத்தைப் பதிவு செய்யவும்.'
                        : 'Record standing-water duration and drainage rate.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'இலைகளில் படிந்துள்ள சேறு மற்றும் வேர் ஆரோக்கியத்தை மதிப்பீடு செய்யவும்.'
                        : 'Assess visible leaf chlorosis and root health condition.'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      {isTa
                        ? 'சரியான ஊட்டச்சத்து மேலாண்மைக்கு மீட்பு மதிப்பீட்டைப் புதுப்பிக்கவும்.'
                        : 'Update recovery assessment to guide corrective nutrient care.'}
                    </span>
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
                {isTa ? 'மழைக்கு பிந்தைய மீட்பு தொகுதி' : 'Post-Rain Assessment Module'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {isTa ? 'தண்ணீர் வடிந்த பிறகு என்ன நடக்கும்?' : 'What Happens After the Water Drains?'}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                {isTa
                  ? 'மழை நின்றவுடன் பகுப்பாய்வு முடிந்துவிடுவதில்லை. பயிர் மீட்பு மதிப்பீட்டைப் புதுப்பிக்க விவசாயிகள் தேங்கிய நீரின் கால அளவு மற்றும் பயிர் நிலையைப் பதிவு செய்யலாம்.'
                  : 'The analysis does not stop when the rainfall ends. Farmers can record standing-water duration and visible crop condition to update the crop recovery assessment.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    {isTa ? 'கள அவதானிப்பு உள்ளீடு' : 'Observation Input'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {isTa ? 'நீர் தேக்க கால அளவு (மணிநேரம்)' : 'Waterlogging Duration (Hours)'}
                  </span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    {isTa ? 'கண்கூடு சேதம்' : 'Visual Damage'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {isTa ? 'இலை சேறு & நீரில் மூழ்குதல்' : 'Leaf Silt & Submergence'}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h4 className="text-base font-bold text-slate-900">
                    {isTa ? 'மழைக்கு பிந்தைய மீட்பு செயல்முறை' : 'Post-Rain Recovery Pipeline'}
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {isTa ? 'களத்தில் சரிபார்க்கப்பட்ட புதுப்பிப்பு' : 'Field-Verified Update'}
                  </span>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <span className="text-slate-600">
                      {isTa ? 'தேங்கிய நீரின் கால அளவு' : 'Standing Water Duration'}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {isTa ? 'பதிவு செய்யப்பட்டது: 24-48 மணிநேரம்' : 'Recorded 24-48 Hours'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <span className="text-slate-600">
                      {isTa ? 'கண்கூடு பயிர் நிலை' : 'Visible Crop Condition'}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {isTa ? 'லேசான இலை மஞ்சள் பூத்தல்' : 'Mild Leaf Chlorosis'}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-900 text-white rounded-lg flex items-center justify-between">
                    <span>
                      {isTa ? 'புதுப்பிக்கப்பட்ட மீட்பு சாத்தியம்' : 'Updated Recovery Potential'}
                    </span>
                    <span className="font-bold text-emerald-300">
                      {isTa ? 'நடுத்தர மீட்பு' : 'MEDIUM RECOVERY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 12 — PROJECT COVERAGE */}
      {/* ========================================================= */}
      <section className="py-20 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-2 block">
              {isTa ? 'நடைமுறை செயல்பாட்டு நோக்கம்' : 'Operational Platform Scope'}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isTa ? 'தளத்தின் முதன்மை செயல்பாடுகள்' : 'Platform Capabilities & Coverage'}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">10</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">
                {isTa ? 'பயிர் வகைகள்' : 'Crop Categories'}
              </span>
              <span className="text-xs text-slate-500">
                {isTa ? 'நெல், மக்காச்சோளம், கரும்பு, பருத்தி மற்றும் பல' : 'Paddy, Maize, Sugarcane, Cotton & more'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">24h / 48h</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">
                {isTa ? 'பகுப்பாய்வு சாளரங்கள்' : 'Analysis Windows'}
              </span>
              <span className="text-xs text-slate-500">
                {isTa ? 'குறுகிய கால தீவிர மழை மதிப்பீடு' : 'Short-term extreme rain evaluation'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">3</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">
                {isTa ? 'மண் தரவு ஆதாரங்கள்' : 'Soil Data Sources'}
              </span>
              <span className="text-xs text-slate-500">
                {isTa ? 'ஆய்வகம், விவசாயி சரிபார்த்தது & SoilGrids' : 'Lab, Farmer Verified & SoilGrids'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-900 block mb-2">PostGIS</span>
              <span className="text-sm font-bold text-slate-800 block mb-1">
                {isTa ? 'புவியியல் வரைபட இயந்திரம்' : 'Farm Geospatial Engine'}
              </span>
              <span className="text-xs text-slate-500">
                {isTa ? 'பலகோண எல்லை சேமிப்பு' : 'Spatial polygon boundary storage'}
              </span>
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
              {isTa ? 'நம்பகத்தன்மை & கட்டமைப்பு' : 'Credibility & Architecture'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {isTa ? 'வெளிப்படையான தரவு மற்றும் அறிவியல் பகுப்பாய்வு' : 'Built on Open Data and Transparent Analysis'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Open-Meteo API',
                desc: isTa
                  ? 'உயர் தெளிவுத்திறன் கொண்ட வானிலை முன்னறிவிப்பு மற்றும் 30 ஆண்டு வரலாற்று காலநிலை மறுபகுப்பாய்வு தரவுத்தொகுப்பு.'
                  : 'High-resolution meteorological forecast and 30-year historical climate reanalysis dataset.',
                tag: isTa ? 'வானிலை & காலநிலை ஆதாரம்' : 'Weather & Climate Source',
              },
              {
                title: 'OpenStreetMap & Leaflet',
                desc: isTa
                  ? 'ஊடாடும் திறந்த மூல புவியியல் வரைபடம் மற்றும் பண்ணை எல்லை வரையும் கருவிகள்.'
                  : 'Interactive open-source geospatial mapping and farm boundary drawing tools.',
                tag: isTa ? 'வரைபட கட்டமைப்பு' : 'Mapping Infrastructure',
              },
              {
                title: 'PostgreSQL + PostGIS',
                desc: isTa
                  ? 'பலகோண வடிவியல் மற்றும் இடஞ்சார்ந்த வினவல்களை ஆதரிக்கும் சக்திவாய்ந்த புவியியல் தரவுத்தளம்.'
                  : 'Robust spatial database supporting polygon geometry and spatial queries.',
                tag: isTa ? 'தரவுத்தளம் & GIS' : 'Database & GIS',
              },
              {
                title: 'ICAR / TNAU Data Sources',
                desc: isTa
                  ? 'விவசாய பயிர் அழுத்த சுயவிவரங்கள், நீரில் மூழ்குதல் சகிப்புத்தன்மை மற்றும் பயிர் காலெண்டர்கள்.'
                  : 'Agronomic crop stress profiles, submergence tolerances and crop calendars.',
                tag: isTa ? 'வேளாண் ஆராய்ச்சி' : 'Agronomic Research',
              },
              {
                title: 'Machine Learning Models',
                desc: isTa
                  ? 'சரிபார்க்கப்பட்ட விவசாய இலக்கு தரவுத்தொகுப்புகளில் பயிற்சி பெற்ற Random Forest & Gradient Boosting மாதிரிகள்.'
                  : 'Random Forest & Gradient Boosting models trained on validated agricultural target datasets.',
                tag: isTa ? 'ML கட்டமைப்பு' : 'ML Architecture',
              },
              {
                title: 'Evidence-Based Rule Engine',
                desc: isTa
                  ? 'வெளிப்படையான, நம்பகமான அபாயக் கணிப்பை உறுதி செய்யும் வேளாண் விதிமுறை கட்டமைப்பு.'
                  : 'Agronomic rule fallback ensuring transparent, zero-hallucination risk scoring.',
                tag: isTa ? 'விதி சார்ந்த இயந்திரம்' : 'Rule-Based Engine',
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
              {isTa ? 'கேள்விகள் & பதில்கள்' : 'Questions & Answers'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {isTa ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions'}
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
                  className="w-full text-left p-6 font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between focus:outline-none cursor-pointer"
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
            {isTa ? 'மழை வயலை அடையும் முன்பே தயாராகுங்கள்.' : 'Prepare Before the Rain Reaches the Field.'}
          </h2>

          <p className="text-lg text-emerald-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            {isTa
              ? 'உங்கள் பண்ணையை வரைபடத்தில் குறிக்கவும், பயிரைச் சேர்க்கவும், வரவிருக்கும் மழை எவ்வாறு பாதிக்கும் என்பதை முன்கூட்டியே அறியவும்.'
              : 'Map your farm, add your crop and understand how upcoming rainfall may affect it.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-9 py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl shadow-xl transition-all text-base"
            >
              {isTa ? 'இப்போதே தொடங்குக' : 'Get Started'}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto px-9 py-4 bg-transparent border border-emerald-500/50 hover:bg-emerald-900 text-white font-semibold rounded-xl transition-colors text-base"
              >
                {isTa ? 'உள்நுழைக' : 'Login'}
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
                {isTa
                  ? 'தீவிர மழை மற்றும் மாறிவரும் காலநிலை சூழலில் பண்ணை சார்ந்த பயிர் பாதிப்பை பகுப்பாய்வு செய்யும் மேம்பட்ட வேளாண் நுண்ணறிவு தளம்.'
                  : 'An advanced agricultural intelligence platform providing farm-specific crop impact analysis under extreme rainfall and changing climate conditions.'}
              </p>
            </div>

            {/* Project Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                {isTa ? 'திட்டம்' : 'PROJECT'}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#hero" className="hover:text-white transition-colors">{isTa ? 'முகப்பு' : 'Home'}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">{isTa ? 'செயல்படும் முறை' : 'How It Works'}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{isTa ? 'அம்சங்கள்' : 'Features'}</a></li>
                <li><a href="#climate-insights" className="hover:text-white transition-colors">{isTa ? 'காலநிலை பகுப்பாய்வு' : 'Climate Analysis'}</a></li>
              </ul>
            </div>

            {/* Application Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                {isTa ? 'செயலி' : 'APPLICATION'}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">{isTa ? 'உள்நுழைக' : 'Login'}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{isTa ? 'பதிவு செய்க' : 'Register'}</Link></li>
                <li><Link to={isAuthenticated ? "/dashboard" : "/login"} className="hover:text-white transition-colors">{isTa ? 'முகப்புப் பலகை' : 'Dashboard'}</Link></li>
                <li><Link to={isAuthenticated ? "/farms" : "/login"} className="hover:text-white transition-colors">{isTa ? 'என் பண்ணைகள்' : 'My Farms'}</Link></li>
              </ul>
            </div>

            {/* Scientific & Legal Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                {isTa ? 'அறிவியல் & சட்டப்பூர்வம்' : 'SCIENTIFIC & LEGAL'}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#about" className="hover:text-white transition-colors">{isTa ? 'கோட்பாடுகள்' : 'Methodology'}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{isTa ? 'தரவு ஆதாரங்கள்' : 'Data Sources'}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{isTa ? 'மாதிரி விவரங்கள்' : 'Model Information'}</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">{isTa ? 'வரம்புகள்' : 'Project Limitations'}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>
              {isTa
                ? '© 2026 CropClimate AI — காலநிலை சார்ந்த வேளாண் நுண்ணறிவு தளம்'
                : '© 2026 CropClimate AI — Climate-Smart Agriculture Platform'}
            </p>
            <p className="mt-2 sm:mt-0">
              {isTa
                ? 'தீவிர வானிலை நிகழ்வுகளுக்கான விவசாய முடிவெடுக்கும் கட்டமைப்பு'
                : 'Decision-Support Architecture for Extreme Weather Events'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
