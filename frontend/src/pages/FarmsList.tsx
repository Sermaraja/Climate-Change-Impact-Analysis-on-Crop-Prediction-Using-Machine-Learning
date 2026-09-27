import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, PlusCircle, Sprout, Layers, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import type { FarmDetailData } from './FarmDetail';
import type { FarmCropData } from '../types/crop';
import { useLanguage } from '../context/LanguageContext';

interface FarmCardItemProps {
  farm: FarmDetailData;
  language: string;
  translateDrainage: (drainage?: string | null) => string;
  translateCrop: (crop?: string | null) => string;
  translateStage: (stage?: string | null) => string;
}

const FarmCardItem: React.FC<FarmCardItemProps> = ({ farm, language, translateDrainage, translateCrop, translateStage }) => {
  // Query active crop for this specific farm
  const { data: cropData } = useQuery<FarmCropData | null>({
    queryKey: ['farmCrop', farm.id],
    queryFn: async () => {
      try {
        const response = await apiClient.get<FarmCropData>(`/farms/${farm.id}/crop`);
        return response.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        return null;
      }
    },
    staleTime: 60000,
  });

  const rawCrop = cropData?.crop_name || 'Paddy';
  const rawStage = cropData?.growth_stage || cropData?.estimated_growth_stage || 'Flowering';
  const cropDisplay = translateCrop(rawCrop);
  const stageDisplay = translateStage(rawStage);

  const drainageText = translateDrainage(farm.drainage_class || 'MODERATE');
  // Avoid repeating 'வடிகால்' if translateDrainage already has it in Tamil
  const drainageDisplay =
    language === 'ta'
      ? drainageText.includes('வடிகால்')
        ? drainageText
        : `${drainageText} வடிகால்`
      : `${drainageText} DRAINAGE`;

  const drainageBadgeClass =
    farm.drainage_class === 'POOR'
      ? 'bg-rose-50 text-rose-800 border-rose-300'
      : farm.drainage_class === 'GOOD'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : 'bg-amber-50 text-amber-900 border-amber-300';

  return (
    <div className="bg-white rounded-2xl border border-[#e2ece5] hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-200 p-6 flex flex-col justify-between group">
      <div>
        {/* Card Header: Title & Drainage Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/farms/${farm.id}`}
              className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors block truncate"
              title={farm.farm_name}
            >
              {farm.farm_name}
            </Link>
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">
                {farm.district || ''}{farm.district && farm.state ? ', ' : ''}{farm.state || ''}
                {' '}({farm.latitude}°, {farm.longitude}°)
              </span>
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 ${drainageBadgeClass}`}>
            {drainageDisplay}
          </span>
        </div>

        {/* Stats Grid: Plot Area & Active Crop */}
        <div className="bg-[#f8faf8] border border-[#e5ede8] rounded-xl p-3.5 space-y-2.5 mb-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              {language === 'ta' ? 'பரப்பளவு:' : 'Plot Area:'}
            </span>
            <span className="font-black text-slate-900 text-sm">
              {farm.area_acres} Acres{' '}
              <span className="text-slate-500 font-medium text-xs">({farm.area_hectares} Ha)</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              {language === 'ta' ? 'பயிர்:' : 'Active Crop:'}
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {cropDisplay}{' '}
              <span className="text-emerald-700 font-semibold text-xs">({stageDisplay})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t border-[#e5ede8] flex items-center justify-between gap-2">
        <Link
          to={`/farms/${farm.id}`}
          className="text-xs font-bold text-slate-700 hover:text-emerald-700 py-1.5 px-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {language === 'ta' ? 'வரைபட எல்லையைப் பார்' : 'View GIS Boundary'}
        </Link>
        <Link
          to="/crop-impact"
          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all py-2 px-3.5 rounded-xl shadow-sm shadow-emerald-600/25 flex items-center gap-1.5"
        >
          <span>{language === 'ta' ? 'மழை பாதிப்பை மதிப்பிடு' : 'Assess Rain Risk'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export const FarmsList: React.FC = () => {
  const { t, language, translateDrainage, translateCrop, translateStage } = useLanguage();
  const { data: farms = [], isLoading, isError, error } = useQuery<FarmDetailData[]>({
    queryKey: ['farms'],
    queryFn: async () => {
      const response = await apiClient.get<FarmDetailData[]>('/farms');
      return response.data;
    },
  });

  return (
    <div>
      <PageHeader
        title={t('farms.title', 'My Farms')}
        subtitle={t('farms.subtitle', 'Manage farm polygon boundaries, crop growth stages, and verified soil profiles')}
        action={
          <Link
            to="/farms/new"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('farms.add_farm', 'Add New Farm')}</span>
          </Link>
        }
      />

      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-700">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
          <p className="text-xs font-semibold text-slate-500">{t('common.loading', 'Loading your registered farms...')}</p>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            {(error as any)?.response?.data?.detail ||
              (language === 'ta' ? 'பண்ணைத் தகவல்களை ஏற்றுவதில் பிழை ஏற்பட்டது.' : 'Failed to load farms from server.')}
          </span>
        </div>
      )}

      {!isLoading && !isError && farms.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-[#e5ede8] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{t('farms.no_farms', 'No Farms Registered Yet')}</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'ta'
                ? 'கனமழை பாதிப்பு கணிப்புகளைப் பெற வரைபடத்தில் உங்கள் பண்ணை எல்லை பலகோணத்தை வரையவும்.'
                : 'Draw your farm boundary polygon on the map to start receiving extreme rainfall impact predictions.'}
            </p>
          </div>
          <Link
            to="/farms/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ta' ? 'முதல் பண்ணை எல்லையை வரை' : 'Draw First Farm Boundary'}</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <FarmCardItem
            key={farm.id}
            farm={farm}
            language={language}
            translateDrainage={translateDrainage}
            translateCrop={translateCrop}
            translateStage={translateStage}
          />
        ))}
      </div>
    </div>
  );
};
