import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { CloudRain, Thermometer, Droplets, Zap } from 'lucide-react';

export const Weather: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Automated Weather & 48h Forecast Engine"
        subtitle="Open-Meteo synoptic API weather integration with prior rainfall history analysis"
        badge="Open-Meteo Ready"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-climate-500/10 text-climate-400">
            <Thermometer className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Temperature Range</div>
            <div className="text-2xl font-bold text-white">28.5°C</div>
            <div className="text-[11px] text-slate-500">Min 24°C • Max 32°C</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-climate-500/10 text-climate-400">
            <Droplets className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Relative Humidity</div>
            <div className="text-2xl font-bold text-white">88%</div>
            <div className="text-[11px] text-amber-400">High saturation (Fungal risk)</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Rainfall Intensity</div>
            <div className="text-2xl font-bold text-amber-300">18.4 mm/hr</div>
            <div className="text-[11px] text-slate-400">Heavy convective storm band</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-climate-400" />
          Previous 24/48/72-Hour Antecedent Rainfall Accumulation
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Antecedent moisture dictates soil absorption limits prior to incoming extreme events.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Prior 24 Hours</div>
            <div className="text-xl font-bold text-white mt-1">42 mm</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Prior 48 Hours</div>
            <div className="text-xl font-bold text-white mt-1">98 mm</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Prior 72 Hours</div>
            <div className="text-xl font-bold text-amber-400 mt-1">145 mm (High Saturation)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
