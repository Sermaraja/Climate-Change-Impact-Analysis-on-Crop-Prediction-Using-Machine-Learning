import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

export const Recovery: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Crop Survival & Post-Rain Recovery Engine"
        subtitle="Predicts crop recovery feasibility after water drainage and delivers before/after actionable guidance"
        badge="Actionable Intelligence"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Before Rain Actions */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Before Heavy Rain (Pre-Event Actions)</h2>
              <p className="text-xs text-slate-400">Immediate field preparation steps</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">Clear Peripheral Drainage Channels:</strong> Remove silt and debris from field bund outlets to accelerate water discharge.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">Suspend Nitrogen Top-Dressing:</strong> Avoid applying urea immediately before heavy rain to prevent fertilizer leaching.
              </div>
            </div>
          </div>
        </div>

        {/* After Rain Recovery Actions */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">After Rain Drainage (Post-Event Recovery)</h2>
              <p className="text-xs text-slate-400">Foliar spray and root restoration</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">Foliar Spray of 1% Potassium Nitrate (KNO3):</strong> Apply once stagnant water recedes to boost plant vigor and root respiration.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white">Fungicide Application (Carbendazim + Mancozeb):</strong> Prevent sheath blight and root rot caused by prolonged waterlogging.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
