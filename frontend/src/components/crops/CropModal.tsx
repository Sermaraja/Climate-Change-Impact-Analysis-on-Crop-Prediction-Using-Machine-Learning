import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import type { MasterCrop, FarmCropData } from '../../types/crop';
import { X, Sprout, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';


import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';


interface CropModalProps {
  farmId: number;
  existingCrop?: FarmCropData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ farmId, existingCrop, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: masterCrops = [], isLoading: isLoadingCrops } = useQuery<MasterCrop[]>({
    queryKey: ['masterCrops'],
    queryFn: async () => {
      const response = await apiClient.get<MasterCrop[]>('/crops');
      return response.data;
    },
    enabled: isOpen,
  });

  const [selectedCropId, setSelectedCropId] = useState<number | ''>('');
  const [selectedVarietyId, setSelectedVarietyId] = useState<number | ''>('');
  const [plantingDate, setPlantingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [season, setSeason] = useState<string>('');
  const [confirmedStage, setConfirmedStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (existingCrop) {
      setSelectedCropId(existingCrop.crop_id);
      setSelectedVarietyId(existingCrop.variety_id || '');
      setPlantingDate(existingCrop.planting_date);
      setSeason(existingCrop.season || '');
      setConfirmedStage(existingCrop.confirmed_growth_stage || '');
    } else if (masterCrops.length > 0 && !selectedCropId) {
      setSelectedCropId(masterCrops[0].id);
    }
  }, [existingCrop, masterCrops, isOpen]);

  const selectedCrop = masterCrops.find((c) => c.id === Number(selectedCropId));
  const varieties = selectedCrop?.varieties || [];
  const growthStages = selectedCrop?.growth_stages || [];

  // Calculate estimated crop age and stage preview
  const calculatedAge = plantingDate
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(plantingDate).getTime()) / (1000 * 3600 * 24)))
    : 0;

  const estimatedStage = growthStages.find(
    (s) => calculatedAge >= s.min_age_days && calculatedAge <= s.max_age_days
  )?.stage_name || (growthStages[0]?.stage_name || 'Vegetative');

  const saveMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      if (!selectedCropId) throw new Error('Please select a crop');
      if (!plantingDate) throw new Error('Please select a planting date');

      const payload = {
        crop_id: Number(selectedCropId),
        variety_id: selectedVarietyId ? Number(selectedVarietyId) : null,
        planting_date: plantingDate,
        season: season || null,
        user_stage_override: confirmedStage || null,
      };

      if (existingCrop) {
        await apiClient.put(`/farms/${farmId}/crop`, payload);
      } else {
        await apiClient.post(`/farms/${farmId}/crop`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmCrop', farmId] });
      queryClient.invalidateQueries({ queryKey: ['farm', farmId] });

      showToast({
        type: 'success',
        message: 'Your farm is ready for analysis.',
        secondaryMessage: 'We can now combine your farm, crop and weather information to assess rainfall-related risk.',
        actionLabel: 'Analyse My Crop',
        onAction: () => navigate('/rain-impact'),
        duration: 8000,
      });

      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to save crop profile');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-card rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-crop-500/20 text-crop-400 flex items-center justify-center border border-crop-500/30">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {existingCrop ? 'Edit Farm Crop Profile' : 'Assign Crop to Farm'}
            </h2>
            <p className="text-xs text-slate-400">Configure crop details, planting date & growth stages</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Select Crop */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Crop <span className="text-rose-400">*</span>
            </label>
            {isLoadingCrops ? (
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-crop-400" /> Loading Master Crops...
              </div>
            ) : (
              <select
                value={selectedCropId}
                onChange={(e) => {
                  setSelectedCropId(Number(e.target.value));
                  setSelectedVarietyId('');
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crop-400"
              >
                <option value="">-- Choose Crop --</option>
                {masterCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.scientific_name ? `(${c.scientific_name})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Variety (Optional) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Crop Variety <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <select
              value={selectedVarietyId}
              onChange={(e) => setSelectedVarietyId(e.target.value ? Number(e.target.value) : '')}
              disabled={!selectedCropId || varieties.length === 0}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crop-400 disabled:opacity-50"
            >
              <option value="">-- No Specific Variety / Default --</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.variety_name} {v.duration_days ? `(${v.duration_days} days)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Planting Date & Season */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Planting Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crop-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Season <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crop-400"
              >
                <option value="">-- Select Season --</option>
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
                <option value="Perennial">Perennial</option>
              </select>
            </div>
          </div>

          {/* Calculated Live Preview Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Calculated Crop Age:</span>
              <span className="font-bold text-crop-400 text-xs">{calculatedAge} Days</span>
            </div>

            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Tag className="w-3 h-3" /> Estimated Growth Stage:
              </span>
              <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800">
                {estimatedStage}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Estimated growth stage is calculated from day ranges. You can confirm or override it below if your field conditions differ.
            </p>
          </div>

          {/* Farmer Override / Confirmed Growth Stage */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Farmer Confirmed Stage <span className="text-slate-500 font-normal">(Override if needed)</span>
            </label>
            <select
              value={confirmedStage}
              onChange={(e) => setConfirmedStage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crop-400"
            >
              <option value="">-- Use System Estimated Stage ({estimatedStage}) --</option>
              {growthStages.map((gs) => (
                <option key={gs.id} value={gs.stage_name}>
                  {gs.stage_name} ({gs.min_age_days}-{gs.max_age_days} days)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-crop-500 to-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-crop-500/20 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>{existingCrop ? 'Save Changes' : 'Save Crop Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
