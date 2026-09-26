import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Globe, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Application Settings"
        subtitle="Configure weather data refresh rates, notification preferences, and bilingual defaults"
      />

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-climate-400" /> Language & Regional Configuration
          </h2>
          <p className="text-xs text-slate-400 mb-3">System support for English & Tamil (தமிழ்)</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-crop-600/30 text-crop-300 border border-crop-500/40 text-xs font-semibold">
              English (Default)
            </button>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 text-xs hover:bg-slate-800">
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-crop-400" /> Database & Weather Source Connections
          </h2>
          <p className="text-xs text-slate-400 mb-2">Primary Provider: Open-Meteo (Free Open API)</p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono">
            Connected: Open-Meteo API v1 (No billing key required)
          </div>
        </div>
      </div>
    </div>
  );
};
