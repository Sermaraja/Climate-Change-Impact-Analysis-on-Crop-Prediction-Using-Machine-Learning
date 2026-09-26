import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Sprout, Save, Info, AlertCircle, Loader2 } from 'lucide-react';
import { FarmMapDrawer } from '../components/gis/FarmMapDrawer';
import { apiClient } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { showToast } = useToast();
  const { t, language } = useLanguage();
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
      setServerError(
        language === 'ta'
          ? 'சேமிப்பதற்கு முன் வரைபடத்தில் குறைந்தது 3 புள்ளிகள் கொண்ட பலகோணத்தை வரையவும்.'
          : 'Please draw a valid 3+ vertex polygon boundary on the map before saving.'
      );
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

      showToast({
        type: 'success',
        message: language === 'ta' ? 'பண்ணை வெற்றிகரமாக சேர்க்கப்பட்டது' : 'Farm added successfully',
        secondaryMessage: language === 'ta' ? 'இப்போது இந்த பண்ணையில் வளரும் பயிரைச் சேர்க்கவும்.' : 'Now add the crop currently growing on this farm.',
        actionLabel: language === 'ta' ? 'பயிரைச் சேர்' : 'Add Crop',
        onAction: () => navigate(`/farms/${response.data.id}`),
        duration: 8000,
      });

      navigate(`/farms/${response.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || (language === 'ta' ? 'பண்ணையைச் சேமிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to save farm polygon to database.');
      setServerError(msg);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('farms.new_farm_title', 'Add Farm Boundary & Crop Profile')}
        subtitle={t('farms.new_farm_subtitle', 'Draw interactive polygon boundary, compute area in acres/ha, and specify drainage profile')}
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
              <Sprout className="w-4 h-4 text-crop-400" /> {language === 'ta' ? 'பண்ணை விவரங்கள்' : 'Farm Attributes'}
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('farms.farm_name', 'Farm Name')} *
              </label>
              <input
                {...register('farm_name')}
                type="text"
                placeholder={language === 'ta' ? 'எ.கா. காவிரி டெல்டா வயல் 1' : 'e.g. Cauvery Delta Plot A'}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crop-500"
              />
              {errors.farm_name && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.farm_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t('farms.state', 'State')}</label>
                <input
                  {...register('state')}
                  type="text"
                  placeholder="Tamil Nadu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t('farms.district', 'District')}</label>
                <input
                  {...register('district')}
                  type="text"
                  placeholder="Thanjavur"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">{t('farms.village', 'Village / Town')}</label>
              <input
                {...register('village')}
                type="text"
                placeholder={language === 'ta' ? 'வடபதி கிராமம்' : 'Vadapathi Village'}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'ta' ? 'மண் வடிகால் தரம்' : 'Soil Drainage Quality'} *
              </label>
              <select
                {...register('drainage_class')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
              >
                <option value="GOOD">{language === 'ta' ? 'நன்று (நல்ல வடிகால் / மணற்பாங்கான வண்டல்)' : 'GOOD (Well Drained / Sandy Loam)'}</option>
                <option value="MODERATE">{language === 'ta' ? 'மிதமான (மிதமான வடிகால் / களிமண் கலந்த வண்டல்)' : 'MODERATE (Moderate Drainage / Clay Loam)'}</option>
                <option value="POOR">{language === 'ta' ? 'மோசமான (மோசமான வடிகால் / நீர் தேங்கும் ஆபத்து)' : 'POOR (Poor Drainage / Waterlogging Prone)'}</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'பண்ணை எல்லை பலகோண வடிவியல் தானியங்கி வானிலை பகுப்பாய்விற்காக PostGIS தரவுத்தளத்தில் சேமிக்கப்படுகிறது.'
                  : 'Boundary polygon geometries are stored natively in PostGIS spatial tables for automated weather overlay analytics.'}
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
                  <span>{language === 'ta' ? 'தரவுத்தளத்தில் சேமிக்கப்படுகிறது...' : 'Saving to PostGIS Database...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'ta' ? 'பண்ணையைச் சேமி' : 'Save Farm Boundary to Database'}</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Map Panel */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-crop-400" /> {language === 'ta' ? 'பண்ணை எல்லை பலகோண வரைபடம்' : 'Interactive OpenStreetMap Boundary Polygon Drawer'}
            </h2>

            <FarmMapDrawer onBoundaryChange={setBoundaryData} />
          </div>
        </div>
      </form>
    </div>
  );
};
