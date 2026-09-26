import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-crop-500/20 text-crop-300 border border-crop-500/30">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
