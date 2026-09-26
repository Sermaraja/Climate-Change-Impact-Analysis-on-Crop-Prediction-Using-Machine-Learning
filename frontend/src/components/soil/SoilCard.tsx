import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { Database, Edit3, FlaskConical, UserCheck, Sparkles, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

export interface SoilProfileData {
  id?: number;
  farm_id: number;
  soil_type: string;
  sand_percentage?: number;
  silt_percentage?: number;
  clay_percentage?: number;
  ph?: number;
  organic_carbon?: number;
  bulk_density?: number;
  soil_source: 'LAB_VERIFIED' | 'FARMER_VERIFIED' | 'ESTIMATED';
  notes?: string;
  is_estimated_fallback: boolean;
}

interface SoilCardProps {
  farmId: number;
}

export const SoilCard: React.FC<SoilCardProps> = ({ farmId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [entryMode, setEntryMode] = useState<'PRESET' | 'LAB' | 'ESTIMATED'>('PRESET');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [sand, setSand] = useState<string>('');
  const [silt, setSilt] = useState<string>('');
  const [clay, setClay] = useState<string>('');
  const [ph, setPh] = useState<string>('');
  const [oc, setOc] = useState<string>('');
  const [bulkDensity, setBulkDensity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { data: soil, isLoading } = useQuery<SoilProfileData>({

    queryKey: ['farmSoil', farmId],
    queryFn: async () => {
      const response = await apiClient.get<SoilProfileData>(`/farms/${farmId}/soil`);
      return response.data;
    },
    enabled: !!farmId,
  });

  const openEditModal = () => {
    if (soil) {
      if (soil.soil_source === 'LAB_VERIFIED') {
        setEntryMode('LAB');
        setSoilType(soil.soil_type);
        setSand(soil.sand_percentage ? String(soil.sand_percentage) : '');
        setSilt(soil.silt_percentage ? String(soil.silt_percentage) : '');
        setClay(soil.clay_percentage ? String(soil.clay_percentage) : '');
        setPh(soil.ph ? String(soil.ph) : '');
        setOc(soil.organic_carbon ? String(soil.organic_carbon) : '');
        setBulkDensity(soil.bulk_density ? String(soil.bulk_density) : '');
        setNotes(soil.notes || '');
      } else if (soil.soil_source === 'FARMER_VERIFIED') {
        setEntryMode('PRESET');
        setSoilType(soil.soil_type);
        setNotes(soil.notes || '');
      } else {
        setEntryMode('ESTIMATED');
      }
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      let payload: any = {};

      if (entryMode === 'PRESET') {
        payload = {
          soil_type: soilType,
          soil_source: 'FARMER_VERIFIED',
          notes: notes || 'Farmer verified soil type selection',
        };
      } else if (entryMode === 'LAB') {
        payload = {
          soil_type: soilType || 'Lab Tested Soil',
          sand_percentage: sand ? parseFloat(sand) : null,
          silt_percentage: silt ? parseFloat(silt) : null,
          clay_percentage: clay ? parseFloat(clay) : null,
          ph: ph ? parseFloat(ph) : null,
          organic_carbon: oc ? parseFloat(oc) : null,
          bulk_density: bulkDensity ? parseFloat(bulkDensity) : null,
          soil_source: 'LAB_VERIFIED',
          notes: notes || 'Verified with laboratory soil test certificate',
        };
      } else {
        // Fallback to estimated regional profile
        payload = {
          soil_type: 'Clay Loam (Regional Estimation)',
          soil_source: 'ESTIMATED',
          notes: 'Estimated regional agricultural GIS fallback profile',
        };
      }

      await apiClient.post(`/farms/${farmId}/soil`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmSoil', farmId] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.detail || 'Failed to update soil profile.');
    },
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-crop-400 mr-2" /> Loading Soil Profile...
      </div>
    );
  }

  const getBadgeStyle = (source: string) => {
    switch (source) {
      case 'LAB_VERIFIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'FARMER_VERIFIED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'LAB_VERIFIED':
        return <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />;
      case 'FARMER_VERIFIED':
        return <UserCheck className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const formatSourceText = (source: string) => {
    switch (source) {
      case 'LAB_VERIFIED':
        return 'Soil Source: Lab Verified';
      case 'FARMER_VERIFIED':
        return 'Soil Source: Farmer Verified';
      default:
        return 'Soil Source: Estimated';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Farm Soil Profile</h3>
        </div>

        <button
          onClick={openEditModal}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Update Soil Info</span>
        </button>
      </div>

      {soil ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{soil.soil_type}</p>
              <p className="text-xs text-slate-400 mt-0.5">{soil.notes || 'No custom notes attached.'}</p>
            </div>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${getBadgeStyle(soil.soil_source)}`}>
              {getSourceIcon(soil.soil_source)}
              <span>{formatSourceText(soil.soil_source)}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Sand %</span>
              <span className="font-bold text-white">{soil.sand_percentage ?? 'N/A'}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Silt %</span>
              <span className="font-bold text-white">{soil.silt_percentage ?? 'N/A'}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Clay %</span>
              <span className="font-bold text-white">{soil.clay_percentage ?? 'N/A'}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Soil pH</span>
              <span className="font-bold text-amber-300">{soil.ph ?? 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Organic Carbon %</span>
              <span className="font-bold text-emerald-300">{soil.organic_carbon ?? 'N/A'}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Bulk Density</span>
              <span className="font-bold text-slate-200">{soil.bulk_density ?? 'N/A'} g/cm³</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">No soil data registered for this farm.</p>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-6 space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" /> Configure Soil Profile
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Entry Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEntryMode('PRESET')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  entryMode === 'PRESET'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1. I know my soil type
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('LAB')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  entryMode === 'LAB'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2. Soil test values
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('ESTIMATED')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  entryMode === 'ESTIMATED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3. Use estimated info
              </button>
            </div>

            {/* Mode 1: Farmer Preset */}
            {entryMode === 'PRESET' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Clay Loam">Clay Loam (Moderate Drainage)</option>
                    <option value="Alluvial Soil">Alluvial Soil (River Delta / Fertile)</option>
                    <option value="Red Soil / Laterite">Red Soil / Laterite (Good Drainage)</option>
                    <option value="Black Cotton Soil (Vertisol)">Black Cotton Soil (Heavy Clay / Waterlogging Prone)</option>
                    <option value="Sandy Loam">Sandy Loam (Rapid Drainage)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Verified by farmer experience"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Lab Verified Values */}
            {entryMode === 'LAB' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Soil Classification Name</label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    placeholder="e.g. Fine Clay Loam (Lab Certified)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Sand %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sand}
                      onChange={(e) => setSand(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Silt %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={silt}
                      onChange={(e) => setSilt(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Clay %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={clay}
                      onChange={(e) => setClay(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">pH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ph}
                      onChange={(e) => setPh(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Organic Carbon %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={oc}
                      onChange={(e) => setOc(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Bulk Density (g/cm³)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bulkDensity}
                      onChange={(e) => setBulkDensity(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Estimated Provider Fallback */}
            {entryMode === 'ESTIMATED' && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <p className="font-bold">Using Regional Estimated Soil Profile</p>
                <p className="text-[11px] text-amber-200/80">
                  Estimated properties will be computed using regional soil surveys for your farm location.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Soil Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
