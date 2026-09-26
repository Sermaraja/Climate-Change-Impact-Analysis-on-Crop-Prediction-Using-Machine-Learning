import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5ede8]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
