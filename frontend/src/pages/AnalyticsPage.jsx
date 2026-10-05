import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Thermometer, 
  Droplets, 
  Wind, 
  Users, 
  Zap, 
  Heart, 
  RefreshCw 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { api } from '../services/api';

export default function AnalyticsPage() {
  const [timespan, setTimespan] = useState('24h');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics(timespan);
      // Format timestamps for chart labels (HH:mm)
      const formatted = (res.history || []).map((item) => ({
        ...item,
        timeLabel: item.timestamp ? item.timestamp.slice(11, 16) : '',
      }));
      setData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [timespan]);

  return (
    <div className="space-y-6">
      {/* Page Header & Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Historical Telemetry & Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous rolling telemetry from SQLite database (Temperature, Humidity, Speed, Swing Arc, Energy)
          </p>
        </div>

        {/* Timespan Filter Pills */}
        <div className="flex items-center space-x-2 bg-[#111827] border border-slate-800 p-1 rounded-xl">
          {['1h', '6h', '24h'].map((t) => (
            <button
              key={t}
              onClick={() => setTimespan(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                timespan === t
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
          <button
            onClick={fetchHistory}
            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors ml-1"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of 4 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Temperature & Humidity */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              Ambient Temperature & Humidity History
            </h3>
            <span className="text-[10px] font-mono text-slate-400">°C vs %RH</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090e18', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#fb7185" strokeWidth={2} name="Temp (°C)" dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} name="Humidity (%)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Adaptive Fan Speed & Dynamic Swing Span */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              Fan Speed (%) & Dynamic Swing Span (Degrees)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">% vs Degrees</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090e18', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="fan_speed" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#speedGrad)" name="Fan Speed (%)" />
                <Line type="monotone" dataKey="swing_span" stroke="#a855f7" strokeWidth={2} name="Swing Span (Deg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Power Draw vs Traditional Fixed 60W */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Power Demand: AeroSense vs Fixed 60W Baseline
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Watts</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="W" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090e18', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="trad_power_watts" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" name="Traditional 60W Fixed" dot={false} />
                <Area type="monotone" dataKey="power_watts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" name="AeroSense AI (Watts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Occupancy Count & Thermal Comfort Score */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-sky-400" />
              Occupancy Count & Thermal Comfort Score
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Score / 100</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090e18', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="comfort_score" stroke="#38bdf8" strokeWidth={2} name="Comfort Score" dot={false} />
                <Line type="stepAfter" dataKey="occupancy_count" stroke="#f59e0b" strokeWidth={2} name="Occupants Detected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
