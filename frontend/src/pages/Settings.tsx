import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Lock, Loader2, BookOpen, Globe } from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface AdminStatsResponse {
  summary_counts: {
    total_users: number;
    total_farms: number;
    total_predictions: number;
    registered_datasets_count: number;
  };
  risk_distribution: Record<string, number>;
  model_metadata: any;
  evidence_sources: {
    id: number;
    name: string;
    institution: string;
    confidence: string;
  }[];
}

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'DATASETS' | 'MODELS' | 'RULES'>('OVERVIEW');

  const {
    data: adminStats,
    isLoading: isAdminLoading,
    isError: isAdminError,
  } = useQuery<AdminStatsResponse>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get<AdminStatsResponse>('/admin/dashboard-stats');
      return res.data;
    },
    retry: false,
  });

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title={t('settings.title', 'Settings')}
        subtitle={t('settings.subtitle', 'Language Preference & Role-Based Research Panel')}
      />

      {/* Language Switcher Section (Stage 21) */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-crop-400" /> {t('settings.language_section', 'Language & Regional User Experience')}
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage('en')}
            className={`px-5 py-2.5 rounded-xl font-bold border transition-colors ${
              language === 'en'
                ? 'bg-crop-500 text-slate-950 border-crop-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            English (Default)
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-5 py-2.5 rounded-xl font-bold border transition-colors ${
              language === 'ta'
                ? 'bg-crop-500 text-slate-950 border-crop-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      {/* Admin Research Panel Section (Stage 22) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> {t('settings.admin_section', 'Scientific Admin & Research Configuration Panel')}
          </h3>
          {adminStats && (
            <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              {t('settings.admin_role_verified', 'ADMIN ROLE VERIFIED')}
            </span>
          )}
        </div>

        {isAdminLoading && (
          <div className="min-h-[20vh] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-crop-400 mb-2" />
            <p className="text-xs">{t('settings.auth_loading', 'Authenticating Administrator Role & Loading Metadata...')}</p>
          </div>
        )}

        {isAdminError && (
          <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center space-y-2">
            <Lock className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">{t('settings.farmer_access_title', 'Farmer Account Access')}</h4>
            <p className="text-slate-400 text-xs">
              {t('settings.farmer_access_desc', 'Scientific configuration and model parameter tuning are restricted to Administrator accounts. Standard farmer operations are accessible via Dashboard and Farm & Crop Impact screens.')}
            </p>
          </div>
        )}

        {adminStats && (
          <div className="space-y-6">
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setAdminTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  adminTab === 'OVERVIEW' ? 'bg-slate-800 text-crop-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('settings.tab_overview', 'Overview & Users')}
              </button>
              <button
                onClick={() => setAdminTab('DATASETS')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  adminTab === 'DATASETS' ? 'bg-slate-800 text-crop-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('settings.tab_datasets', 'Dataset Registry')}
              </button>
              <button
                onClick={() => setAdminTab('MODELS')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  adminTab === 'MODELS' ? 'bg-slate-800 text-crop-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('settings.tab_models', 'Model Metrics')}
              </button>
              <button
                onClick={() => setAdminTab('RULES')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  adminTab === 'RULES' ? 'bg-slate-800 text-crop-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('settings.tab_rules', 'Evidence Sources')}
              </button>
            </div>

            {/* Overview Tab */}
            {adminTab === 'OVERVIEW' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{t('settings.total_users', 'Total Users')}</span>
                  <span className="text-xl font-bold text-white">{adminStats.summary_counts.total_users}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{t('settings.total_farms', 'Total Registered Farms')}</span>
                  <span className="text-xl font-bold text-crop-300">{adminStats.summary_counts.total_farms}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{t('settings.total_predictions', 'Predictions Executed')}</span>
                  <span className="text-xl font-bold text-cyan-300">{adminStats.summary_counts.total_predictions}</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{t('settings.registered_datasets', 'Registered Datasets')}</span>
                  <span className="text-xl font-bold text-amber-300">{adminStats.summary_counts.registered_datasets_count}</span>
                </div>
              </div>
            )}

            {/* Evidence Sources Tab */}
            {adminTab === 'RULES' && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" /> {t('settings.evidence_catalog', 'Peer-Reviewed Evidence Sources Catalog')}
                </h4>
                <div className="space-y-2">
                  {adminStats.evidence_sources.map((src) => (
                    <div key={src.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{src.name}</p>
                        <p className="text-slate-400 text-[11px]">{t('settings.institution', 'Institution')}: {src.institution}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {src.confidence} {t('settings.confidence', 'CONFIDENCE')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
