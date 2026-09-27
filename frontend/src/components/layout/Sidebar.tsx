import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  CloudRain,
  Activity,
  LineChart,
  History,
  FileText,
  Settings,
  Sprout,
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageToggle } from '../common/LanguageToggle';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t, language } = useLanguage();

  const navItems = [
    { name: t('nav.dashboard'), shortName: language === 'ta' ? 'முகப்பு' : 'Home', path: '/dashboard', icon: LayoutDashboard, tourTag: 'dashboard' },
    { name: t('nav.farm_impact') || 'Farm & Crop Impact', shortName: language === 'ta' ? 'பாதிப்பு' : 'Impact', path: '/crop-impact', icon: ShieldAlert, highlight: true, tourTag: 'analyse-crop' },
    { name: t('nav.my_farms'), shortName: language === 'ta' ? 'பண்ணை' : 'Farms', path: '/farms', icon: MapPin, tourTag: 'my-farms' },
    { name: language === 'ta' ? 'எச்சரிக்கைகள்' : 'Alerts', shortName: language === 'ta' ? 'எச்சரிக்கை' : 'Alerts', path: '/alerts', icon: Activity, tourTag: 'alerts' },
    { name: t('nav.weather_forecast'), shortName: language === 'ta' ? 'வானிலை' : 'Weather', path: '/weather', icon: CloudRain, tourTag: 'weather' },
    { name: t('nav.recovery'), shortName: language === 'ta' ? 'மீட்பு' : 'Recovery', path: '/recovery', icon: Sprout, tourTag: 'recovery' },
    { name: t('nav.climate_analysis'), shortName: language === 'ta' ? 'காலநிலை' : 'Climate', path: '/climate-analysis', icon: LineChart, tourTag: 'climate-analysis' },
    { name: t('nav.history'), shortName: language === 'ta' ? 'வரலாறு' : 'History', path: '/history', icon: History, tourTag: 'history' },
    { name: t('nav.reports'), shortName: language === 'ta' ? 'அறிக்கை' : 'Reports', path: '/reports', icon: FileText, tourTag: 'reports' },
    { name: t('nav.settings'), shortName: language === 'ta' ? 'அமைவு' : 'Settings', path: '/settings', icon: Settings, tourTag: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sleek Icon Sidebar (Reference 1 Style - 68px width) */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-50 w-[68px] bg-white border-r border-[#e5ede8] flex-col items-center py-4 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {/* Brand Sprout Logo */}
        <div className="mb-4 flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 hover:scale-105 transition-transform cursor-pointer"
            title="CropClimate AI"
          >
            <Sprout className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Icon Navigation List */}
        <nav className="flex-1 w-full flex flex-col items-center space-y-1 overflow-y-auto py-1 px-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-tour={item.tourTag}
                title={item.name}
                className={({ isActive }) =>
                  `w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 group relative cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-emerald-700'}`} />
                    <span
                      className={`text-[9px] font-bold leading-none mt-1 tracking-tight max-w-[50px] text-center truncate ${
                        isActive ? 'text-white' : 'text-slate-700 group-hover:text-emerald-900'
                      }`}
                    >
                      {item.shortName}
                    </span>
                    {item.highlight && !isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Quick Indicator */}
        <div className="mt-auto pt-2 flex flex-col items-center">
          <div
            className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] font-bold"
            title="AI Crop Intelligence Active"
          >
            AI
          </div>
        </div>
      </aside>

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-[#e5ede8] flex flex-col transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#e5ede8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-slate-900 leading-tight">
                CropClimate <span className="text-emerald-600">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                {t('tagline')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Language Switcher */}
        <div className="px-4 pt-3 pb-1">
          <LanguageToggle variant="pill" className="w-full justify-center" />
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          <div className="px-3 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t('nav.core_modules')}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-tour={item.tourTag}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-emerald-600'
                          : 'text-slate-400 group-hover:text-emerald-600'
                      }`}
                    />
                    <span className="flex-1 truncate font-semibold">{item.name}</span>
                    {item.highlight && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 rounded-md">
                        {t('dashboard.core_ml_badge')}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
