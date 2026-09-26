import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Globe, Bell, CloudLightning, User, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../../services/api';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');

  const { data: healthData, isError } = useQuery({
    queryKey: ['backendHealth'],
    queryFn: fetchHealthStatus,
    refetchInterval: 15000,
    retry: 2,
  });

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/60 px-4 lg:px-8 flex items-center justify-between">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Weather alert ticker placeholder */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <CloudLightning className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 text-[11px]">System Status:</span>
          <span className="text-emerald-400 font-medium text-[11px]">Open-Meteo Integration Ready</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
            healthData?.status === 'healthy'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isError
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title={healthData?.application || 'Checking backend status...'}
        >
          {healthData?.status === 'healthy' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">API Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">API Disconnected</span>
            </>
          )}
        </div>

        {/* Language selector (English / Tamil architecture ready) */}
        <button
          onClick={() => setLang(lang === 'EN' ? 'TA' : 'EN')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-colors"
          title="Toggle Language (EN / TA)"
        >
          <Globe className="w-3.5 h-3.5 text-climate-400" />
          <span className="font-semibold">{lang}</span>
          <span className="text-[10px] text-slate-500">{lang === 'EN' ? 'English' : 'தமிழ்'}</span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
        </button>

        {/* Account menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <Link
            to="/login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crop-600/20 hover:bg-crop-600/30 border border-crop-500/30 text-crop-300 hover:text-white text-xs font-medium transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
