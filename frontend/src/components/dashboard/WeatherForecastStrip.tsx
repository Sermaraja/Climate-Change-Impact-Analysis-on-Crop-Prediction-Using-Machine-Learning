import React from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, Sunrise, Sunset } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherForecastStripProps {
  currentTemp?: number;
  currentHumidity?: number;
  windSpeed?: number;
  forecast24h?: number;
  forecast48h?: number;
  hourlyData?: Array<{
    time: string;
    precipitation_mm: number;
    temperature_celsius?: number;
  }>;
}

export const WeatherForecastStrip: React.FC<WeatherForecastStripProps> = ({
  currentTemp = 28,
  currentHumidity = 72,
  windSpeed = 6.5,
  forecast24h = 12.5,
  forecast48h = 24.0,
  hourlyData = [],
}) => {
  const { t, language } = useLanguage();

  // Days of week forecast cards
  const daysOfWeek = [
    { day: language === 'ta' ? 'வெள்ளி' : 'Friday', fullDay: true },
    { day: language === 'ta' ? 'சனி' : 'SAT', temp: Math.round(currentTemp + 1), icon: CloudRain, rainChance: '65%' },
    { day: language === 'ta' ? 'ஞாயிறு' : 'SUN', temp: Math.round(currentTemp), icon: CloudRain, rainChance: '70%' },
    { day: language === 'ta' ? 'திங்கள்' : 'MON', temp: Math.round(currentTemp - 1), icon: Cloud, rainChance: '20%' },
    { day: language === 'ta' ? 'செவ்வாய்' : 'TUE', temp: Math.round(currentTemp + 2), icon: Sun, rainChance: '10%' },
    { day: language === 'ta' ? 'புதன்' : 'WED', temp: Math.round(currentTemp + 1), icon: CloudRain, rainChance: '45%' },
    { day: language === 'ta' ? 'வியாழன்' : 'THU', temp: Math.round(currentTemp), icon: Cloud, rainChance: '15%' },
  ];

  // Format hourly trend points for Recharts
  const chartData =
    hourlyData.length >= 6
      ? hourlyData.slice(0, 8).map((pt) => ({
          time: pt.time.includes('T') ? pt.time.split('T')[1].substring(0, 5) : pt.time,
          rain: pt.precipitation_mm || 0,
        }))
      : [
          { time: '10 AM', rain: 0.5 },
          { time: '12 PM', rain: 4.8 },
          { time: '02 PM', rain: 7.6 },
          { time: '04 PM', rain: 2.1 },
          { time: '06 PM', rain: 0.4 },
        ];

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
      {/* 1. Featured Today Card (Rich Agricultural Green - Reference 2) */}
      <div className="lg:col-span-4 xl:col-span-3 agri-card-green rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
              {daysOfWeek[0].day}
            </span>
            <span className="text-[10px] text-emerald-200 block font-medium">{nowTime}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
            {language === 'ta' ? 'இன்று' : 'Today'}
          </span>
        </div>

        <div className="my-2 flex items-center justify-between">
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {currentTemp}°
            </span>
            <span className="text-[11px] text-emerald-100 block mt-0.5 font-medium">
              {language === 'ta' ? 'உணரும் நிலை' : 'Real Feel'} {Math.round(currentTemp + 2)}°C
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Sun className="w-6 h-6 text-amber-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-white/20 pt-2 text-emerald-100">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-300" />
            <span>{windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-emerald-300" />
            <span>{currentHumidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunrise className="w-3 h-3 text-amber-300" />
            <span>06:05 AM</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="w-3 h-3 text-amber-300" />
            <span>06:20 PM</span>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Daily Forecast Days (Reference 2) */}
      <div className="lg:col-span-5 xl:col-span-6 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {daysOfWeek.slice(1).map((item, idx) => {
          const Icon = item.icon || Sun;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-2.5 border border-[#e5ede8] shadow-xs flex flex-col items-center justify-between text-center hover:border-emerald-300 hover:shadow-sm transition-all group"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-emerald-700">
                {item.day}
              </span>
              <div className="my-1.5 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Icon className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-extrabold text-slate-900">{item.temp}°</span>
              <span className="text-[9px] text-emerald-600 font-bold mt-0.5">
                {item.rainChance}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Mini Hourly Precipitation Trend Chart (Reference 2) */}
      <div className="lg:col-span-3 xl:col-span-3 bg-white rounded-2xl p-3 border border-[#e5ede8] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-emerald-600" />
            {t('dashboard.forecast_hourly_title', 'Precipitation')}
          </span>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {forecast24h} mm
          </span>
        </div>

        <div className="h-20 w-full my-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="rainColor" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: '10px',
                }}
                formatter={(val: any) => [`${val} mm`, t('weather.rainfall', 'Rainfall')]}
              />
              <Area type="monotone" dataKey="rain" stroke="#059669" strokeWidth={1.5} fill="url(#rainColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1.5 border-t border-slate-100">
          <span>{language === 'ta' ? 'அடுத்த 48 மணி நேர மழை' : '48h Forecast'}: {forecast48h} mm</span>
          <span className="font-semibold text-emerald-700">Open-Meteo</span>
        </div>
      </div>
    </div>
  );
};
