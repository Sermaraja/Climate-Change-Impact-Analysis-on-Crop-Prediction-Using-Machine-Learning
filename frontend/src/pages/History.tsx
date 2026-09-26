import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { History as HistoryIcon } from 'lucide-react';

export const History: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Prediction History & Model Audit Trail"
        subtitle="Reproducible record of prediction inputs, model versions, and outputs"
        badge="Reproducibility Ready"
      />

      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-crop-400" /> Assessment Audit Log
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          All inference inputs (rain intensity, growth stage, soil type source) are saved with model version tags.
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 text-center">
          No previous predictions recorded yet. Run your first assessment in the Rainfall Risk module.
        </div>
      </div>
    </div>
  );
};
