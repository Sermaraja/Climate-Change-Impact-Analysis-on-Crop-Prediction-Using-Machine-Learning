import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { MapPin, Search, Sprout, Save, Info } from 'lucide-react';

export const FarmNew: React.FC = () => {
  const [soilSource, setSoilSource] = useState<'LAB_VERIFIED' | 'FARMER_VERIFIED' | 'ESTIMATED'>('FARMER_VERIFIED');

  // Thanjavur, Tamil Nadu default center
  const center: [number, number] = [10.7870, 79.1378];

  const samplePolygon: [number, number][] = [
    [10.7880, 79.1368],
    [10.7890, 79.1390],
    [10.7860, 79.1395],
    [10.7855, 79.1370],
  ];

  return (
    <div>
      <PageHeader
        title="Add Farm Boundary & Crop Profile"
        subtitle="Search location, draw polygon boundary, set crop stage, and specify verified soil type"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-crop-400" /> Farm Metadata Setup
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Farm Name</label>
            <input
              type="text"
              placeholder="e.g. Delta Paddy Plot A"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crop-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Crop Type</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500">
                <option value="paddy">Paddy / Rice</option>
                <option value="maize">Maize / Corn</option>
                <option value="cotton">Cotton</option>
                <option value="sugarcane">Sugarcane</option>
                <option value="pulses">Black Gram / Pulses</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Crop Variety</label>
              <input
                type="text"
                placeholder="e.g. CR1009 / Samba"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crop-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Planting Date</label>
              <input
                type="date"
                defaultValue="2026-08-15"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Growth Stage</label>
              <select className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-crop-500">
                <option value="germination">Germination / Seedling</option>
                <option value="vegetative">Vegetative Growth</option>
                <option value="flowering">Flowering / Reproductive</option>
                <option value="ripening">Grain Filling / Maturity</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-1">Soil Source Integrity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['LAB_VERIFIED', 'FARMER_VERIFIED', 'ESTIMATED'] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSoilSource(source)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors ${
                    soilSource === source
                      ? 'bg-crop-500/20 text-crop-300 border-crop-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {source.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-crop-400 shrink-0 mt-0.5" />
            <span>
              Verified soil sources take priority over automated regional estimates in ML calculations.
            </span>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-crop-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Farm Boundary Polygon</span>
          </button>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 glass-card p-4 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-crop-400" />
              <span className="text-xs font-bold text-white">Interactive OpenStreetMap Farm Boundary</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search district or town..."
                className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crop-500"
              />
              <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 relative z-0">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center}>
                <Popup>
                  Thanjavur Farm Location <br /> 10.7870° N, 79.1378° E
                </Popup>
              </Marker>
              <Polygon positions={samplePolygon} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.35 }} />
            </MapContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Approximate Calculated Area: <strong className="text-crop-400">4.25 Acres (1.72 Ha)</strong></span>
            <span className="text-[11px]">Leaflet + OpenStreetMap Map Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
