import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { Cpu, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';


export interface CropDamageResponse {
  prediction_id: number;
  farm_id: number;
  farm_crop_id: number;
  crop_name: string;
  damage_class: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE' | 'TOTAL_LOSS';
  survival_probability: number;
  estimated_yield_loss_pct: number;
  confidence_score: number;
  model_version: string;
  main_input_factors: string[];
  created_at: string;
}

interface CropDamageCardProps {
  farmId: number;
}

export const CropDamageCard: React.FC<CropDamageCardProps> = ({ farmId }) => {
  const queryClient = useQueryClient();

  const { data: damage, isLoading, isError, refetch } = useQuery<CropDamageResponse>({
    queryKey: ['cropDamageAnalysis', farmId],
    queryFn: async () => {
      const res = await apiClient.get<CropDamageResponse>(`/farms/${farmId}/analyse-crop-damage`);
      return res.data;
    },
    enabled: !!farmId,
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<CropDamageResponse>(`/farms/${farmId}/analyse-crop-damage`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cropDamageAnalysis', farmId] });
      refetch();
    },
  });

  const getDamageBadgeStyle = (damageClass?: string) => {
    switch (damageClass) {
      case 'TOTAL_LOSS':
      case 'SEVERE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MILD':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">ML Crop Damage Intelligence Model</h3>
        </div>

        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${runMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Run ML Inference</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400 mr-2" /> Running Machine Learning Crop Survival Model...
        </div>
      ) : isError || !damage ? (
        <p className="text-xs text-slate-400">Assign a crop profile to this farm to run ML damage inference.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Predicted Crop Damage Class</span>
              <span className={`inline-block px-3 py-1 mt-1 rounded-lg text-xs font-bold border ${getDamageBadgeStyle(damage.damage_class)}`}>
                {damage.damage_class} DAMAGE
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Survival Probability</span>
              <span className="text-xl font-bold text-emerald-300">{Math.round(damage.survival_probability * 100)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Estimated Yield Loss %</span>
              <span className="text-lg font-bold text-rose-300">{damage.estimated_yield_loss_pct}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Model Confidence Score</span>
              <span className="text-lg font-bold text-purple-300">{Math.round(damage.confidence_score * 100)}%</span>
            </div>
          </div>

          {/* Main Contributing Factors */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
            <span className="font-semibold text-slate-300 block">Main ML Input Factors:</span>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
              {damage.main_input_factors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1 text-purple-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Model: DecisionTree / RandomForest ({damage.model_version})
            </span>
            <span className="text-slate-500">Evaluated: {new Date(damage.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
