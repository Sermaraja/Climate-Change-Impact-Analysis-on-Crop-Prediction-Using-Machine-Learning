import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { Waves, RefreshCw, Loader2, Info } from 'lucide-react';


export interface WaterloggingResponse {
  prediction_id: number;
  farm_id: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  waterlogging_probability: number;
  saturation_index: number;
  contributing_factors: string[];
  explanation: string;
  data_sources: string[];
  model_version: string;
  created_at: string;
}

interface WaterloggingCardProps {
  farmId: number;
}

export const WaterloggingCard: React.FC<WaterloggingCardProps> = ({ farmId }) => {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading, isError, refetch } = useQuery<WaterloggingResponse>({
    queryKey: ['waterloggingAnalysis', farmId],
    queryFn: async () => {
      const res = await apiClient.get<WaterloggingResponse>(`/farms/${farmId}/waterlogging-analysis`);
      return res.data;
    },
    enabled: !!farmId,
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<WaterloggingResponse>(`/farms/${farmId}/waterlogging-analysis`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterloggingAnalysis', farmId] });
      refetch();
    },
  });

  const getRiskStyle = (risk?: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODERATE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Waterlogging Risk Engine</h3>
        </div>

        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${runMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Re-Run Hydrological Model</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Computing Soil Saturation & Waterlogging Risk...
        </div>
      ) : isError || !analysis ? (
        <p className="text-xs text-slate-400">Failed to calculate waterlogging risk.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Hydrological Soil Saturation Index</span>
              <span className="text-lg font-bold text-white">{analysis.saturation_index}</span>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getRiskStyle(analysis.risk_level)}`}>
                {analysis.risk_level} WATERLOGGING RISK
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Probability: {Math.round(analysis.waterlogging_probability * 100)}%</span>
            </div>
          </div>

          {/* Formula Explanation Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">Risk Formula Contributing Factors:</span>
            <p className="text-crop-300 font-mono text-[11px] leading-relaxed">{analysis.explanation}</p>
          </div>

          {/* Data Sources Badge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Data Sources: {analysis.data_sources.join(' • ')}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Model: {analysis.model_version}</span>
          </div>
        </div>
      )}
    </div>
  );
};
