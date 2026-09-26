import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Sprout, Save, Info, AlertCircle, Loader2 } from 'lucide-react';
import { FarmMapDrawer } from '../components/gis/FarmMapDrawer';
import { apiClient } from '../services/api';

const farmSchema = z.object({
  farm_name: z.string().min(2, 'Farm name must be at least 2 characters'),
  state: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  drainage_class: z.enum(['GOOD', 'MODERATE', 'POOR']),
});


type FarmFormValues = z.infer<typeof farmSchema>;

export const FarmNew: React.FC = () => {
  const navigate = useNavigate();
  const [boundaryData, setBoundaryData] = useState<{
    boundaryGeoJSON: any | null;
    latitude: number;
    longitude: number;
    areaAcres: number;
    areaHectares: number;
  }>({
    boundaryGeoJSON: null,
    latitude: 10.7870,
    longitude: 79.1378,
    areaAcres: 0,
    areaHectares: 0,
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      drainage_class: 'MODERATE',
    },
  });

  const onSubmit = async (values: FarmFormValues) => {
    setServerError(null);

    if (!boundaryData.boundaryGeoJSON || boundaryData.areaAcres <= 0) {
      setServerError('Please draw a valid 3+ vertex polygon boundary on the map before saving.');
      return;
    }

    try {
      const payload = {
        farm_name: values.farm_name,
        latitude: boundaryData.latitude,
        longitude: boundaryData.longitude,
        boundary_geojson: boundaryData.boundaryGeoJSON,
        area_acres: boundaryData.areaAcres,
        state: values.state,
        district: values.district,
        village: values.village,
        drainage_class: values.drainage_class,
      };

      const response = await apiClient.post('/farms', payload);
      navigate(`/farms/${response.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to save farm polygon to database.';
      setServerError(msg);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Farm Boundary & Crop Profile"
        subtitle="Draw interactive polygon boundary, compute area in acres/ha, and specify drainage profile"
      />

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Form Panel */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-crop-400" /> Farm Attributes
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Farm Name *</label>
              <input
                {...register('farm_name')}
                type="text"
                placeholder="e.g. Cauvery Delta Plot A"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crop-500"
              />
              {errors.farm_name && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.farm_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
                <input
                  {...register('state')}
                  type="text"
                  placeholder="Tamil Nadu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
                <input
                  {...register('district')}
                  type="text"
                  placeholder="Thanjavur"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Village / Town</label>
              <input
                {...register('village')}
                type="text"
                placeholder="Vadapathi Village"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Soil Drainage Quality *</label>
              <select
                {...register('drainage_class')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
              >
                <option value="GOOD">GOOD (Well Drained / Sandy Loam)</option>
                <option value="MODERATE">MODERATE (Moderate Drainage / Clay Loam)</option>
                <option value="POOR">POOR (Poor Drainage / Waterlogging Prone)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <span>
                Boundary polygon geometries are stored natively in PostGIS spatial tables for automated weather overlay analytics.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-crop-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to PostGIS Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Farm Boundary to Database</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Map Panel */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-crop-400" /> Interactive OpenStreetMap Boundary Polygon Drawer
            </h2>

            <FarmMapDrawer onBoundaryChange={setBoundaryData} />
          </div>
        </div>
      </form>
    </div>
  );
};
