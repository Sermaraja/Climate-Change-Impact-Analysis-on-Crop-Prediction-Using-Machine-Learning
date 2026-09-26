import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  CloudRain,
  Activity,
  LineChart,
  History,
  FileText,
  Settings,
  Sprout,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Farms', path: '/farms', icon: MapPin },
  { name: 'Add Farm', path: '/farms/new', icon: PlusCircle },
  { name: 'Weather Forecast', path: '/weather', icon: CloudRain },
  { name: 'Rainfall & Waterlog Risk', path: '/rain-impact', icon: ShieldAlert, highlight: true },
  { name: 'Recovery Prediction', path: '/recovery', icon: Activity },
  { name: 'Climate Change Trends', path: '/climate-analysis', icon: LineChart },
  { name: 'Prediction History', path: '/history', icon: History },
  { name: 'Reports & Export', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 glass-panel border-r border-slate-800/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/60 bg-gradient-to-r from-crop-950/40 via-slate-900/50 to-climate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crop-500 to-climate-600 p-0.5 shadow-lg shadow-crop-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-crop-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
                Agri<span className="text-crop-400">Impact</span> ML
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Climate Risk Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Core Modules
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-crop-600/30 to-crop-500/10 text-white border border-crop-500/40 shadow-sm shadow-crop-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/40 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-crop-400'
                          : 'text-slate-400 group-hover:text-crop-300'
                      }`}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.highlight && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                        Core ML
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-crop-400 ml-auto" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom MSc Status Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-crop-500 animate-ping" />
              <span className="text-[11px] font-medium text-slate-300">
                MSc Research Engine
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Climate impact analysis on crop survival & recovery
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
