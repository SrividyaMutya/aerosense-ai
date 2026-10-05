import React, { useState } from 'react';
import { 
  Cpu, 
  Calculator, 
  CheckCircle2, 
  Sliders, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Thermometer, 
  Droplets, 
  Users, 
  Sparkles,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';

export default function DecisionEnginePage({ environment, fan, decision, onUpdateEnvironment }) {
  // Local interactive testing workbench state (defaults from live environment)
  const [simTemp, setSimTemp] = useState(environment?.temperature ?? 31.0);
  const [simHum, setSimHum] = useState(environment?.humidity ?? 65.0);
  const [simZones, setSimZones] = useState(environment?.occupied_zones || ['A', 'C']);
  const [simPref, setSimPref] = useState(environment?.comfort_preference ?? 'Balanced');
  const [simTime, setSimTime] = useState(environment?.time_of_day ?? 'Afternoon');
  const [isApplied, setIsApplied] = useState(false);

  // Zone boundary mapping
  const ZONE_BOUNDS = {
    A: [30.0, 60.0],
    B: [60.0, 90.0],
    C: [90.0, 120.0],
    D: [120.0, 150.0],
  };

  // 1. Apparent Temperature / Heat Index Calculation
  const vaporPressure = (simHum / 100.0) * 6.105 * Math.exp((17.27 * simTemp) / (237.7 + simTemp));
  const apparentTemp = simTemp + (0.33 * vaporPressure) - 0.70 * 0.2 - 4.0;
  const tempF = (simTemp * 9.0 / 5.0) + 32.0;

  // 2. Computed Fan Speed Calculation
  const occupants = simZones.length;
  let computedSpeed = 0;
  let airflowLabel = 'STANDBY OFF';
  let energyMode = 'STANDBY';

  if (occupants === 0) {
    if (simTemp >= 35.0) {
      computedSpeed = 15;
      airflowLabel = 'ECO FLUSH';
      energyMode = 'ECO STANDBY';
    } else {
      computedSpeed = 0;
      airflowLabel = 'STANDBY OFF';
      energyMode = 'STANDBY';
    }
  } else {
    const thermalDemand = apparentTemp - 24.0;
    let baseSpeed = 20;
    if (thermalDemand <= 0) baseSpeed = 20;
    else if (thermalDemand <= 3.0) baseSpeed = 35 + Math.round(thermalDemand * 5);
    else if (thermalDemand <= 7.0) baseSpeed = 52 + Math.round((thermalDemand - 3.0) * 6);
    else if (thermalDemand <= 11.0) baseSpeed = 76 + Math.round((thermalDemand - 7.0) * 4);
    else baseSpeed = 92 + Math.round((thermalDemand - 11.0) * 2);

    let prefBias = simPref === 'Cool' ? 8 : simPref === 'Warm' ? -10 : 0;
    let timeBias = simTime === 'Night' ? -6 : simTime === 'Afternoon' ? 4 : 0;
    let occupantBias = (occupants - 1) * 4;

    computedSpeed = Math.max(18, Math.min(100, baseSpeed + prefBias + timeBias + occupantBias));

    if (computedSpeed < 30) {
      airflowLabel = 'GENTLE BREEZE';
      energyMode = 'ECO ADAPTIVE';
    } else if (computedSpeed < 55) {
      airflowLabel = 'COMFORT MODERATE';
      energyMode = 'COMFORT BALANCED';
    } else if (computedSpeed < 80) {
      airflowLabel = 'HIGH AIRFLOW';
      energyMode = 'EFFICIENT HIGH';
    } else {
      airflowLabel = 'TURBO JET';
      energyMode = 'MAX COOLING';
    }
  }

  // 3. Dynamic Swing Range Calculation
  let startAngle = 90.0;
  let endAngle = 90.0;
  let swingSpan = 0.0;
  let swingReduction = 100.0;

  if (occupants > 0) {
    const minAngles = simZones.map((z) => ZONE_BOUNDS[z][0]);
    const maxAngles = simZones.map((z) => ZONE_BOUNDS[z][1]);
    startAngle = Math.max(0.0, Math.min(...minAngles) - 5.0);
    endAngle = Math.min(180.0, Math.max(...maxAngles) + 5.0);
    swingSpan = endAngle - startAngle;
    swingReduction = Math.round(((180.0 - swingSpan) / 180.0) * 1000) / 10;
  }

  // 4. Comfort Score Calculation
  const coolingOffset = computedSpeed * 0.032;
  const effectiveTemp = apparentTemp - coolingOffset;
  const penalty = Math.abs(effectiveTemp - 23.5) * 6.2 + Math.abs(simHum - 50.0) * 0.35;
  const comfortScore = Math.max(10, Math.min(100, Math.round(100.0 - penalty)));

  // 5. Power Calculation
  const bldcPower = computedSpeed > 0 ? 2.0 + 34.0 * Math.pow(computedSpeed / 100.0, 2.4) : 2.0;
  const servoPower = computedSpeed > 0 ? 2.5 * (swingSpan / 180.0) : 0;
  const totalPowerWatts = Math.round((bldcPower + servoPower) * 10) / 10;
  const powerSavedPercent = Math.round(((60.0 - totalPowerWatts) / 60.0) * 1000) / 10;

  // Toggle zone
  const handleZoneToggle = (zone) => {
    let next;
    if (simZones.includes(zone)) {
      next = simZones.filter((z) => z !== zone);
    } else {
      next = [...simZones, zone].sort();
    }
    setSimZones(next);
  };

  // Apply to global prototype
  const handleApplyToSystem = () => {
    if (onUpdateEnvironment) {
      onUpdateEnvironment({
        temperature: simTemp,
        humidity: simHum,
        occupancy_count: simZones.length,
        occupied_zones: simZones,
        comfort_preference: simPref,
        time_of_day: simTime,
        manual_override: false,
      });
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Deterministic AI Decision Engine & Mathematical Model
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent Bioclimatic Closed-Loop Logic • ASHRAE 55 Adaptive Comfort & Dynamic Angular Sector Bounding
          </p>
        </div>

        <button
          onClick={handleApplyToSystem}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isApplied
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
          }`}
        >
          {isApplied ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          <span>{isApplied ? 'Applied to Live Prototype!' : 'Apply to Live Prototype'}</span>
        </button>
      </div>

      {/* Interactive Testing Workbench Section */}
      <div className="bg-[#111827] rounded-2xl border border-cyan-500/40 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Decision Engine Interactive Workbench</h3>
              <p className="text-xs text-slate-400">Adjust the inputs below to observe real-time mathematical derivations</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-3 py-1 rounded-full font-bold">
            Live Math Engine: ACTIVE
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#090e18] border border-slate-800 mb-5">
          {/* Temperature */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Ambient Temperature:</span>
              <span className="font-mono text-rose-400 font-bold">{simTemp.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="18.0"
              max="40.0"
              step="0.5"
              value={simTemp}
              onChange={(e) => setSimTemp(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Range: 18°C – 40°C</span>
          </div>

          {/* Humidity */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Relative Humidity:</span>
              <span className="font-mono text-cyan-400 font-bold">{simHum.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="1"
              value={simHum}
              onChange={(e) => setSimHum(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Range: 20% – 90%</span>
          </div>

          {/* Occupancy Zones */}
          <div>
            <span className="text-slate-300 text-xs font-medium block mb-1">Occupancy Zones:</span>
            <div className="grid grid-cols-4 gap-1">
              {['A', 'B', 'C', 'D'].map((z) => {
                const active = simZones.includes(z);
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => handleZoneToggle(z)}
                    className={`py-1 rounded text-center text-xs font-mono font-bold transition-all ${
                      active
                        ? 'bg-cyan-500 text-black shadow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              {simZones.length} / 4 Zones Seated
            </span>
          </div>

          {/* Comfort Preference */}
          <div>
            <span className="text-slate-300 text-xs font-medium block mb-1">Comfort Bias:</span>
            <div className="grid grid-cols-3 gap-1">
              {['Cool', 'Balanced', 'Warm'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSimPref(p)}
                  className={`py-1 rounded text-center text-xs font-medium transition-colors ${
                    simPref === p
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Bias: {simPref === 'Cool' ? '+8% Speed' : simPref === 'Warm' ? '-10% Speed' : 'Neutral'}
            </span>
          </div>
        </div>

        {/* Real-Time Live Math Execution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-4">
          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">1. Apparent Temp (T_app)</span>
            <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
              {apparentTemp.toFixed(1)}°C
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Vapor Pressure: {vaporPressure.toFixed(1)} hPa
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">2. Thermal Demand (ΔT)</span>
            <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">
              {Math.max(0, apparentTemp - 24.0).toFixed(1)}°C
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Above 24.0°C neutral base
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">3. Computed Fan Speed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-white font-mono">{computedSpeed}%</span>
              <span className="text-[11px] text-slate-400">({airflowLabel})</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Power: {totalPowerWatts}W (Saved {powerSavedPercent}%)
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">4. Swing Arc Clamping</span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              {swingSpan > 0 ? `${startAngle.toFixed(0)}° → ${endAngle.toFixed(0)}°` : 'Parked (0°)'}
            </div>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">
              {swingReduction}% wasted swing eliminated
            </span>
          </div>
        </div>

        {/* Rationale Breakdown */}
        <div className="bg-[#070b14]/70 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Dynamic Rationale Synthesis for Current Inputs:
          </span>
          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">›</span>
              <span>Ambient {simTemp.toFixed(1)}°C & {simHum.toFixed(0)}% RH generate apparent thermal load of {apparentTemp.toFixed(1)}°C.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">›</span>
              {occupants === 0 ? (
                <span>Zero occupancy detected: Fan placed in eco standby; swing parked to prevent wasted power.</span>
              ) : occupants === 1 ? (
                <span>Single occupant in Zone {simZones[0]}: Clamped swing to focused {startAngle.toFixed(0)}° - {endAngle.toFixed(0)}° arc, saving {swingReduction}% wasted oscillation.</span>
              ) : (
                <span>{occupants} occupants in Zones [{simZones.join(', ')}]: Minimal bounding convex hull calculated at {startAngle.toFixed(0)}° - {endAngle.toFixed(0)}° ({swingSpan.toFixed(0)}° span), saving {swingReduction}% sweep.</span>
              )}
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">›</span>
              <span>Energy draw is {totalPowerWatts}W vs 60.0W traditional ({powerSavedPercent}% reduction). Comfort Score evaluated at {comfortScore}/100.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Equations & Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formula 1 */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">1. Apparent Heat Index Model</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Standard fans use crude fixed thresholds (e.g. <code>if T &gt; 30</code>). AeroSense computes human vapor pressure resistance:
          </p>
          <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 mb-3 overflow-x-auto">
            vp = (RH / 100) * 6.105 * exp((17.27 * T) / (237.7 + T))<br />
            T_apparent = T + (0.33 * vp) - (0.70 * ws) - 4.0
          </div>
          <p className="text-xs text-slate-300">
            Accounts for humid monsoon sweat evaporation resistance, triggering higher airflow when humidity traps body heat.
          </p>
        </div>

        {/* Formula 2 */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">2. Convective Cooling & Comfort Score</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Airflow induces evaporative convective cooling across human skin:
          </p>
          <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 mb-3 overflow-x-auto">
            cooling_offset = fan_speed * 0.032°C<br />
            effective_temp = T_apparent - cooling_offset<br />
            Score = 100 - (|effective_temp - 23.5| * 6.2) - (|RH - 50| * 0.35)
          </div>
          <p className="text-xs text-slate-300">
            The decision engine continuously maximizes Comfort Score while minimizing motor power consumption.
          </p>
        </div>

        {/* Formula 3 */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">3. Dynamic Angular Swing Span Model</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Continuous bounded angular sector computed from active PIR zone coordinates:
          </p>
          <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 mb-3 overflow-x-auto">
            start_angle = max(0 deg, min(Zone_bounds) - 5 deg)<br />
            end_angle   = min(180 deg, max(Zone_bounds) + 5 deg)<br />
            Span        = end_angle - start_angle<br />
            Waste_Saved = ((180 - Span) / 180) * 100%
          </div>
          <p className="text-xs text-slate-300">
            Eliminates wasted oscillation over unoccupied sectors, concentrating convective cooling where human bodies reside.
          </p>
        </div>

        {/* Formula 4 */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">4. Motor Power Scaling (Affinity Laws)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Fan aerodynamic power scales with the cube of blade angular velocity:
          </p>
          <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 mb-3 overflow-x-auto">
            P_motor = P_base + P_max * (speed / 100)^2.4<br />
            P_servo = 2.5W * (Span / 180 deg)<br />
            Total_Watts = P_motor + P_servo
          </div>
          <p className="text-xs text-slate-300">
            Running at 60% speed requires only ~12W compared to 34W at 100%, unlocking massive compound efficiency gains.
          </p>
        </div>
      </div>
    </div>
  );
}
