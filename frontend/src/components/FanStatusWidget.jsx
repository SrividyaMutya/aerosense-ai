import React, { useState } from 'react';
import { 
  Gauge, 
  RotateCw, 
  Power, 
  Wind, 
  Sliders, 
  Compass, 
  Sparkles, 
  Check, 
  Activity 
} from 'lucide-react';

export default function FanStatusWidget({ fan, onManualControl }) {
  const [showControls, setShowControls] = useState(false);
  const [manualSpeed, setManualSpeed] = useState(fan?.speed_percent ?? 50);

  const isFanOn = fan?.is_on;
  const speed = fan?.speed_percent ?? 0;
  const rpm = fan?.rpm_estimate ?? 0;
  const angle = fan?.current_angle ?? 90;
  const swingSpan = fan?.swing_span ?? 0;
  const swingStart = fan?.swing_start_angle ?? 0;
  const swingEnd = fan?.swing_end_angle ?? 180;
  const intensity = fan?.airflow_intensity ?? 'OFF';
  const isAdaptive = fan?.operating_mode === 'AI Adaptive';

  const handleSpeedChange = (val) => {
    setManualSpeed(val);
    if (onManualControl) {
      onManualControl({ speed_percent: parseInt(val), mode: 'Manual Override' });
    }
  };

  const handleTogglePower = () => {
    if (onManualControl) {
      onManualControl({ power: !isFanOn, mode: 'Manual Override' });
    }
  };

  const handleRestoreAi = () => {
    if (onManualControl) {
      onManualControl({ mode: 'AI Adaptive' });
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Fan Actuation Telemetry</h3>
              <p className="text-[11px] text-slate-400">Hardware servo pan & BLDC motor state</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1.5">
            {isAdaptive ? (
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AI Controlled
              </span>
            ) : (
              <button
                onClick={handleRestoreAi}
                className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-amber-900"
              >
                Restore AI
              </button>
            )}
          </div>
        </div>

        {/* Primary Gauges Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Fan Speed & RPM */}
          <div className="bg-[#090e18] rounded-xl border border-slate-800/80 p-3 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              Speed & RPM
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                {isFanOn ? speed : 0}
              </span>
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono mt-0.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>{isFanOn ? rpm : 0} RPM</span>
            </div>

            {/* Speed Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full transition-all duration-300"
                style={{ width: `${isFanOn ? speed : 0}%` }}
              />
            </div>
          </div>

          {/* Instantaneous Angle Needle & Bounds */}
          <div className="bg-[#090e18] rounded-xl border border-slate-800/80 p-3 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
              Pan Heading
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono">
                {angle.toFixed(0)}°
              </span>
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              {swingSpan > 0 ? `${swingStart.toFixed(0)}° → ${swingEnd.toFixed(0)}°` : 'Parked 90°'}
            </div>

            {/* Angular Arc Indicator Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 relative">
              <div 
                className="bg-cyan-500/30 h-full absolute"
                style={{
                  left: `${(swingStart / 180) * 100}%`,
                  width: `${(swingSpan / 180) * 100}%`,
                }}
              />
              <div 
                className="bg-cyan-400 w-2 h-full absolute transition-all duration-100"
                style={{
                  left: `calc(${(angle / 180) * 100}% - 4px)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Status Indicators Pill Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Motor Power</span>
            <span className={`font-bold font-mono ${isFanOn ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isFanOn ? 'ON' : 'STANDBY'}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Airflow Level</span>
            <span className="font-bold text-cyan-300 font-mono text-[11px]">
              {intensity}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Oscillation</span>
            <span className="font-bold text-slate-200 font-mono text-[11px]">
              {fan?.is_oscillating ? `${swingSpan}° Arc` : 'Fixed Focus'}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Override Controls Drawer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {showControls ? 'Hide Manual Override' : 'Test Manual Hardware Control'}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {showControls ? '▲' : '▼'}
          </span>
        </button>

        {showControls && (
          <div className="mt-3 space-y-3 bg-[#080d16] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Power Toggle:</span>
              <button
                onClick={handleTogglePower}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  isFanOn ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isFanOn ? 'Turn Fan Off' : 'Turn Fan On'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Manual Speed Duty:</span>
                <span className="font-mono text-cyan-400 font-bold">{manualSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={manualSpeed}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRestoreAi}
              className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors shadow"
            >
              Resume AI Adaptive Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
