import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CloudRain,
  ShieldAlert,
  Activity,
  PlusCircle,
  AlertTriangle,
  ChevronRight,
  Droplets,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const mockRainfallData = [
  { day: 'Mon', rain: 12, threshold: 45 },
  { day: 'Tue', rain: 28, threshold: 45 },
  { day: 'Wed', rain: 65, threshold: 45 },
  { day: 'Thu', rain: 80, threshold: 45 },
  { day: 'Fri', rain: 35, threshold: 45 },
  { day: 'Sat', rain: 18, threshold: 45 },
  { day: 'Sun', rain: 5, threshold: 45 },
];

export const Dashboard: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Farmer Impact Dashboard"
        subtitle="Real-time extreme weather assessment & machine-learning crop risk engine"
        badge="Stage 1 Architecture Ready"
        action={
          <Link
            to="/rain-impact"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Run Rainfall Risk Engine</span>
          </Link>
        }
      />

      {/* Core Operational Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-crop-950/60 border border-crop-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Internal Risk Classification System</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MODERATE / HIGH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates Rainfall Amount + Intensity + Duration + Prior 72h Rain + Soil Drainage + Crop Growth Stage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link
            to="/farms/new"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-crop-400" />
            <span>Add Farm Boundary</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Registered Farms</span>
            <div className="p-2 rounded-xl bg-crop-500/10 text-crop-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">3 Active</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">10.5 Acres</span> total polygon area
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">24h Rainfall Forecast</span>
            <div className="p-2 rounded-xl bg-climate-500/10 text-climate-400">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">65 mm</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-climate-400" />
            Intensity: <span className="text-amber-300 font-medium">18 mm/hr (Heavy)</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Waterlogging Likelihood</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">High (72%)</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soil: Clay Loam (Poor Drainage)
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Predicted Crop Recovery</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">Moderate Post-Drain</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Action required within 48h
          </p>
        </div>
      </div>

      {/* Main Section: Chart & Quick Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-climate-400" />
                7-Day Rainfall Projection vs Waterlog Damage Threshold
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compares expected daily accumulation against soil saturation point
              </p>
            </div>
            <span className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              Open-Meteo Synced
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRainfallData}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="mm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rain"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rainGrad)"
                  name="Forecast Rain (mm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Core Flow Quick Access */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Decision Workflow</h2>
            <p className="text-xs text-slate-400 mb-4">
              Step-by-step extreme weather assessment for your active crops.
            </p>

            <div className="space-y-3">
              <Link
                to="/farms"
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-crop-500/10 text-crop-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">1. Farm & Soil Profile</h3>
                    <p className="text-[10px] text-slate-400">Paddy • Flowering Stage • Clay Soil</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/rain-impact"
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">2. Rainfall Damage Model</h3>
                    <p className="text-[10px] text-slate-400">Intensity + Prior 72h Accumulation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>

              <Link
                to="/recovery"
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">3. Recovery & Loss Mitigation</h3>
                    <p className="text-[10px] text-slate-400">Action recommendations before/after rain</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Soil Data Source:</span>{' '}
            <span className="text-crop-400 font-mono">FARMER_VERIFIED</span> (Prioritized over estimated)
          </div>
        </div>
      </div>
    </div>
  );
};
