import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, HelpCircle, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: healthData, isError } = useQuery({
    queryKey: ['backendHealth'],
    queryFn: fetchHealthStatus,
    refetchInterval: 15000,
    retry: 2,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartTour = () => {
    window.dispatchEvent(new CustomEvent('open-product-tour'));
  };

  // Center Navigation Pills (Clean, concise, never-wrapping tabs matching Reference 1)
  const navPills = [
    { label: language === 'ta' ? 'முகப்பு' : 'Overview', path: '/dashboard' },
    { label: language === 'ta' ? 'பயிர் பாதிப்பு' : 'Crop Impact', path: '/rain-impact' },
    { label: language === 'ta' ? 'பண்ணைகள்' : 'Farms', path: '/farms' },
    { label: language === 'ta' ? 'வானிலை' : 'Weather', path: '/weather' },
    { label: language === 'ta' ? 'அறிக்கைகள்' : 'Reports', path: '/reports' },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#e5ede8] px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Brand / Location Header */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
            CropClimate <span className="text-emerald-600">AI</span>
          </span>
          <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[10px] font-semibold whitespace-nowrap">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>Thanjavur, TN</span>
          </span>
        </div>
      </div>

      {/* Center: Clean Navigation Pills (Direct from Reference 1 - single line, never wrapping) */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#f1f5f2] p-1 rounded-full border border-slate-200/60 shrink-0">
        {navPills.map((pill) => {
          const isActive = location.pathname === pill.path;
          return (
            <Link
              key={pill.path}
              to={pill.path}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {pill.label}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls: Tour, Status, Language Switcher, Notifications, User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Product Tour Help Button */}
        <button
          onClick={handleStartTour}
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
          title={t('nav.help_tour', 'Tour')}
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline text-[11px] font-semibold">
            {language === 'ta' ? 'வழிகாட்டி' : 'Tour'}
          </span>
        </button>

        {/* Backend health status badge */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-medium border ${
            healthData?.status === 'healthy'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isError
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
          title={healthData?.application || t('status.loading')}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${healthData?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="hidden xl:inline">
            {healthData?.status === 'healthy' ? (language === 'ta' ? 'இணைப்பு' : 'Online') : 'Offline'}
          </span>
        </div>

        {/* Language Switcher Toggle */}
        <LanguageToggle variant="pill" />

        {/* Notifications */}
        <button
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>

        {/* Account Menu */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
          {user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold max-w-[80px] truncate text-[11px] hidden md:inline">{user.full_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs transition-colors cursor-pointer"
                title={t('nav.logout')}
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <User className="w-3 h-3" />
              <span>{t('nav.login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
