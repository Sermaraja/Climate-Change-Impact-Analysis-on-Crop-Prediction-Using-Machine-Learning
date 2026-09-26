import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { FileText, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Reports & Export Engine"
        subtitle="Generate farmer impact summary PDFs, insurance assessment dossiers, and research exports"
        badge="Export Ready"
      />

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-crop-400" /> Executive & Farmer Report Dossiers
        </h2>
        <p className="text-xs text-slate-400">
          Export full risk breakdowns including growth stage vulnerability, soil moisture indices, and recommended recovery protocols.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4 text-crop-400" />
            <span>Download Farm Impact Dossier (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
