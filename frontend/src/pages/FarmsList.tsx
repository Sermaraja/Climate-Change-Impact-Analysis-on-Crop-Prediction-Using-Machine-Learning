import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { MapPin, PlusCircle, Sprout, Calendar, Layers, ChevronRight } from 'lucide-react';

const mockFarms = [
  {
    id: 'farm-1',
    name: 'Cauvery Delta Plot A',
    location: 'Thanjavur, Tamil Nadu (10.7870° N, 79.1378° E)',
    area: '4.2 Acres',
    crop: 'Paddy (Samba - CR1009)',
    plantingDate: '2026-08-10',
    ageDays: 47,
    growthStage: 'Flowering / Reproductive',
    soilType: 'Clay Loam',
    soilSource: 'LAB_VERIFIED',
    drainage: 'Moderate',
    riskLevel: 'MODERATE',
  },
  {
    id: 'farm-2',
    name: 'Green Valley Plot B',
    location: 'Madurai, Tamil Nadu (9.9252° N, 78.1198° E)',
    area: '3.5 Acres',
    crop: 'Maize (CO-6)',
    plantingDate: '2026-09-01',
    ageDays: 25,
    growthStage: 'Vegetative',
    soilType: 'Sandy Clay Loam',
    soilSource: 'FARMER_VERIFIED',
    drainage: 'Good',
    riskLevel: 'LOW',
  },
  {
    id: 'farm-3',
    name: 'Riverbed Alluvial Plot C',
    location: 'Trichy, Tamil Nadu (10.7905° N, 78.7047° E)',
    area: '2.8 Acres',
    crop: 'Cotton (MCU-5)',
    plantingDate: '2026-07-20',
    ageDays: 68,
    growthStage: 'Boll Formation',
    soilType: 'Heavy Clay',
    soilSource: 'ESTIMATED',
    drainage: 'Poor / Waterlog Prone',
    riskLevel: 'HIGH',
  },
];

export const FarmsList: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="My Farms"
        subtitle="Manage farm polygon boundaries, crop growth stages, and verified soil profiles"
        action={
          <Link
            to="/farms/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-crop-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Farm</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFarms.map((farm) => (
          <div
            key={farm.id}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-crop-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-crop-300 transition-colors">
                    {farm.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {farm.location}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    farm.riskLevel === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : farm.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {farm.riskLevel} RISK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-crop-400" /> Crop & Stage:
                  </span>
                  <span className="font-semibold text-white">{farm.crop}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-climate-400" /> Age / Stage:
                  </span>
                  <span className="font-medium text-slate-200">
                    {farm.ageDays} days ({farm.growthStage})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" /> Soil & Source:
                  </span>
                  <span className="font-medium text-slate-200">
                    {farm.soilType}{' '}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-crop-400 font-mono">
                      {farm.soilSource}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Area: {farm.area}</span>
              <Link
                to="/rain-impact"
                className="text-xs font-medium text-crop-400 hover:text-crop-300 flex items-center gap-1"
              >
                <span>Assess Rain Risk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
