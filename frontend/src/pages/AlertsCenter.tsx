import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  RefreshCw, Info
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface AlertItem {
  id: number;
  farm_id: number;
  farm_name: string;
  location: string;
  crop_name: string;
  growth_stage: string;
  application_impact_level: string; // GREEN, YELLOW, ORANGE, RED
  rain_risk: string;
  waterlogging_risk: string;
  damage_risk: string;
  survival_class: string;
  recovery_class: string;
  loss_risk: string;
  rain_24h: number;
  rain_48h: number;
  previous_rain_72h: number;
  main_factors: string[];
  engine_type: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export const AlertsCenter: React.FC = () => {
  const { translateCrop, translateStage, translateRisk } = useLanguage();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: alerts = [], refetch } = useQuery<AlertItem[]>({
    queryKey: ['alerts', statusFilter],
    queryFn: async () => {
      const res = await apiClient.get<AlertItem[]>(`/alerts?status_filter=${statusFilter}`);
      return res.data;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiClient.post(`/alerts/${alertId}/acknowledge`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiClient.post(`/alerts/${alertId}/resolve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5ede8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Farm & Crop Alerts
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time farm-specific risk notifications, scientific causes, and operational action tracking.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Tabs & Counters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-red-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setStatusFilter('ACKNOWLEDGED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'ACKNOWLEDGED'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Acknowledged ({acknowledgedCount})
        </button>
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#e5ede8] shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No alerts in this view</h3>
            <p className="text-xs text-slate-500 mt-1">
              All active farms are within normal operational thresholds or no matching alerts found.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isRed = alert.application_impact_level === 'RED';
            const isOrange = alert.application_impact_level === 'ORANGE';
            const isYellow = alert.application_impact_level === 'YELLOW';

            const borderColor = isRed
              ? 'border-l-red-600'
              : isOrange
              ? 'border-l-orange-500'
              : isYellow
              ? 'border-l-yellow-400'
              : 'border-l-emerald-500';

            const badgeBg = isRed
              ? 'bg-red-50 text-red-700 border-red-200'
              : isOrange
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : isYellow
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl p-5 border border-[#e5ede8] border-l-4 ${borderColor} shadow-xs space-y-4`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{alert.farm_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeBg}`}>
                        {alert.application_impact_level} IMPACT RISK
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {alert.location || 'Farm registered'} • {translateCrop(alert.crop_name)} ({translateStage(alert.growth_stage)})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        alert.status === 'ACTIVE'
                          ? 'bg-red-100 text-red-700'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {alert.created_at?.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rainfall 24h</span>
                    <span className="font-bold text-sky-700 mt-0.5 block">{alert.rain_24h} mm</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Waterlogging</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{translateRisk(alert.waterlogging_risk)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Damage Risk</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{translateRisk(alert.damage_risk)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Survival</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{translateRisk(alert.survival_class)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{translateRisk(alert.recovery_class)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Engine</span>
                    <span className="font-semibold text-slate-600 mt-0.5 block">{alert.engine_type}</span>
                  </div>
                </div>

                {/* Factors ("Why This Alert") */}
                <div className="bg-amber-50/40 rounded-xl p-3 border border-amber-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    Contributing Risk Factors:
                  </span>
                  <ul className="space-y-1">
                    {alert.main_factors.map((f, i) => (
                      <li key={i} className="text-xs text-amber-950 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions / Lifecycle Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {alert.acknowledged_at && `Acknowledged on ${alert.acknowledged_at.slice(0, 10)}`}
                    {alert.resolved_at && ` • Resolved on ${alert.resolved_at.slice(0, 10)}`}
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Acknowledge Alert
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
