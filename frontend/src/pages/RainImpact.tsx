import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RainImpact: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Rainfall Risk & Waterlogging Assessment"
        subtitle="Core Machine Learning task assessing extreme rain tolerance, damage risk & waterlogging likelihood"
        badge="Core Purpose Module"
      />

      {/* Core Operational Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">1. Internal Risk Level</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HIGH RISK
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Expected Rain:</span>
              <span className="font-bold text-white">85 mm (Heavy)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Storm Duration:</span>
              <span className="font-medium text-slate-200">6.5 Hours</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Prior 72h Rain:</span>
              <span className="font-medium text-amber-300">145 mm</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">2. Waterlogging Risk</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              78% LIKELY
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Soil Drainage:</span>
              <span className="font-medium text-slate-200">Poor (Clay Loam)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Soil Moisture:</span>
              <span className="font-bold text-slate-100">82% Field Capacity</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated Stagnation:</span>
              <span className="font-medium text-rose-400">36 - 48 Hours</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">3. Crop Damage Risk</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              SEVERE (FLOWERS AT RISK)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Crop & Stage:</span>
              <span className="font-semibold text-white">Paddy (Flowering Stage)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Stage Submergence Limit:</span>
              <span className="font-medium text-slate-300">Max 24h</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Projected Yield Loss:</span>
              <span className="font-bold text-rose-400">25% - 35% without action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI / Model Rationalization */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 mb-8">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-crop-400" />
          Explainable ML Prediction Rationale
        </h2>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong className="text-white">Growth Stage Sensitivity:</strong> Paddy during flowering stage has high vulnerability to panicle submergence and pollen wash-off.
          </p>
          <p>
            • <strong className="text-white">Antecedent Moisture Saturation:</strong> Prior 72h rainfall (145 mm) already elevated soil moisture to 82%, meaning the soil absorption index is depleted.
          </p>
          <p>
            • <strong className="text-white">Soil Source Reliability:</strong> Calculation weighted with <span className="text-crop-400 font-mono">FARMER_VERIFIED</span> soil texture input (Clay Loam).
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            to="/recovery"
            className="px-4 py-2 rounded-xl bg-crop-600 hover:bg-crop-500 text-white font-medium text-xs flex items-center gap-2 transition-all"
          >
            <span>View Farmer Pre & Post Rain Actions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
