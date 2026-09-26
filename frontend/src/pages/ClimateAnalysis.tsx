import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LineChart as LineIcon } from 'lucide-react';

export const ClimateAnalysis: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Historical Climate Change Analysis"
        subtitle="Long-term rainfall & temperature anomaly trends and extreme weather event frequencies"
        badge="MSc Research Analytics"
      />

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <LineIcon className="w-4 h-4 text-climate-400" /> Decadal Monsoonal Shift & Extreme Event Frequency
        </h2>
        <p className="text-xs text-slate-400">
          This module tracks 30-year climate shift indicators, contrasting intense short-duration rainfall spikes against crop physiological thresholds.
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          Historical ERA5 / Open-Meteo climate reanalysis integration ready.
        </div>
      </div>
    </div>
  );
};
