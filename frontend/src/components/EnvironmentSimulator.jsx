import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Users, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  RotateCcw, 
  Heart,
  SlidersHorizontal 
} from 'lucide-react';

export default function EnvironmentSimulator({ environment, onUpdate, onReset }) {
  const {
    temperature = 28,
    humidity = 55,
    occupancy_count = 1,
    occupied_zones = ['A'],
    comfort_preference = 'Balanced',
    time_of_day = 'Afternoon',
  } = environment || {};

  const handleTempChange = (newTemp) => {
    onUpdate({
      ...environment,
      temperature: parseFloat(newTemp),
    });
  };

  const handleHumidityChange = (newHum) => {
    onUpdate({
      ...environment,
      humidity: parseFloat(newHum),
    });
  };

  const handlePreferenceChange = (pref) => {
    onUpdate({
      ...environment,
      comfort_preference: pref,
    });
  };

  const handleTimeChange = (time) => {
    onUpdate({
      ...environment,
      time_of_day: time,
    });
  };

  const handleZoneToggle = (zone) => {
    let nextZones;
    if (occupied_zones.includes(zone)) {
      nextZones = occupied_zones.filter((z) => z !== zone);
    } else {
      nextZones = [...occupied_zones, zone].sort();
    }
    onUpdate({
      ...environment,
      occupied_zones: nextZones,
      occupancy_count: nextZones.length,
    });
  };

  const timeOptions = [
    { id: 'Morning', icon: Sunrise, label: 'Morning' },
    { id: 'Afternoon', icon: Sun, label: 'Afternoon' },
    { id: 'Evening', icon: Sunset, label: 'Evening' },
    { id: 'Night', icon: Moon, label: 'Night' },
  ];

  const prefOptions = [
    { id: 'Cool', label: 'Cooler (-2°C)', desc: 'Prioritize higher airflow' },
    { id: 'Balanced', label: 'Balanced (Neutral)', desc: 'Optimal thermal comfort' },
    { id: 'Warm', label: 'Warmer (+2°C)', desc: 'Gentle calm breeze' },
  ];

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Environment & Sensor Simulator</h3>
            <p className="text-[11px] text-slate-400">Manipulate room conditions to test live adaptive responses</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
          title="Reset to default environment"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Temperature Slider */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              Ambient Temperature
            </span>
            <span className="font-mono text-sm font-bold text-rose-400">
              {temperature.toFixed(1)}°C
            </span>
          </div>
          <input
            type="range"
            min="18.0"
            max="40.0"
            step="0.5"
            value={temperature}
            onChange={(e) => handleTempChange(e.target.value)}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>18°C (Cool)</span>
            <span>26°C (Optimal)</span>
            <span>40°C (Extreme)</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Relative Humidity
            </span>
            <span className="font-mono text-sm font-bold text-cyan-400">
              {humidity.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="90"
            step="1"
            value={humidity}
            onChange={(e) => handleHumidityChange(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>20% (Dry)</span>
            <span>50% (Comfort)</span>
            <span>90% (Humid)</span>
          </div>
        </div>

        {/* Occupancy Zones Toggles */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Active Occupancy Zones
            </span>
            <span className="font-mono text-xs font-bold text-sky-400">
              {occupancy_count} Occupants
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['A', 'B', 'C', 'D'].map((zone) => {
              const active = occupied_zones.includes(zone);
              return (
                <button
                  key={zone}
                  onClick={() => handleZoneToggle(zone)}
                  className={`py-2 px-1 text-center rounded-lg border font-mono text-xs font-bold transition-all ${
                    active
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div>Zone {zone}</div>
                  <div className="text-[10px] font-sans font-normal text-slate-400 mt-0.5">
                    {active ? '● Occupied' : 'Empty'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Comfort Bias & Time of Day */}
        <div className="grid grid-cols-2 gap-3">
          {/* Comfort Bias */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Comfort Bias
            </label>
            <div className="space-y-1">
              {prefOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handlePreferenceChange(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                    comfort_preference === opt.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  {opt.id}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Time of Day
            </label>
            <div className="space-y-1">
              {timeOptions.map((t) => {
                const Icon = t.icon;
                const isSelected = time_of_day === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTimeChange(t.id)}
                    className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
