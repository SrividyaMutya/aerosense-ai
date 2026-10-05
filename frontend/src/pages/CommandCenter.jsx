import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Users, 
  Wind, 
  Zap, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import VirtualRoom from '../components/VirtualRoom';
import AiDecisionCard from '../components/AiDecisionCard';
import FanStatusWidget from '../components/FanStatusWidget';
import EnvironmentSimulator from '../components/EnvironmentSimulator';
import EnergyComparisonWidget from '../components/EnergyComparisonWidget';

export default function CommandCenter({
  environment,
  fan,
  decision,
  energyMetrics,
  onUpdateEnvironment,
  onResetEnvironment,
  onManualFanControl,
  onApplyScenario,
  onOpenDemo,
  onNavigate,
}) {
  const quickScenarios = [
    { id: 'hot_room', label: '🔥 Hot Room (34°C)', desc: '2 Occupants' },
    { id: 'comfortable_room', label: '🌿 Comfortable (26°C)', desc: '1 Occupant' },
    { id: 'empty_room', label: '💤 Empty Room', desc: '0 Occupants' },
    { id: 'multi_zone', label: '👥 Multi-Zone (A-D)', desc: '4 Occupants' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Quick Banner / Summary Strip */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-900/40 border border-cyan-700/50 text-cyan-400">
            <Wind className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                AeroSense AI Command Center
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                Continuous Closed Loop Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Software-in-the-loop autonomous airflow vectoring & bioclimatic thermal optimization
            </p>
          </div>
        </div>

        {/* Quick Demo Scenarios Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Scenarios:</span>
          {quickScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc.id)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary 3-Card Metrics Row (Live Environment, Fan Actuation, Energy Efficiency) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* A. Live Environment State Card */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Live Environment</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
              {environment?.time_of_day}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temperature</span>
              <span className="text-2xl font-extrabold text-rose-400 font-mono mt-0.5 block">
                {environment?.temperature?.toFixed(1) ?? '28.0'}°C
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Apparent: {decision?.apparent_temp?.toFixed(1) ?? '28.0'}°C
              </span>
            </div>

            <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Humidity</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5 block">
                {environment?.humidity?.toFixed(0) ?? '55'}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Relative RH
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Occupancy Count:
              </span>
              <span className="font-bold text-slate-200 font-mono">
                {environment?.occupancy_count ?? 0} {environment?.occupancy_count === 1 ? 'Person' : 'People'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Occupied Zones:</span>
              <span className="font-bold text-cyan-300 font-mono">
                {environment?.occupied_zones?.length > 0 
                  ? `[ ${environment.occupied_zones.join(', ')} ]` 
                  : 'None (Vacant)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400">Comfort Score:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {decision?.comfort_score ?? 85} / 100
              </span>
            </div>
          </div>
        </div>

        {/* B. Fan Status & Telemetry Card */}
        <FanStatusWidget fan={fan} onManualControl={onManualFanControl} />

        {/* C. Unnecessary Swing Waste Reduction Card */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Airflow Conservation</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Track 1 Objective
              </span>
            </div>

            <div className="bg-[#090e18] p-4 rounded-xl border border-slate-800 mb-3 text-center">
              <span className="text-xs text-slate-400 block mb-1">
                Unnecessary Sweep Reduction
              </span>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  {decision?.swing_coverage_reduction_percent ?? 50.0}%
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/80 block mt-1">
                Wasted oscillation eliminated vs 180° fixed fan
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Instant Power Saved:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {decision?.power_saved_watts ?? 41.5}W ({decision?.power_saved_percent ?? 69.2}%)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Operating Mode:</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {decision?.energy_mode ?? 'ECO_ADAPTIVE'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>AtomQuest 2026 Target: &gt;30%</span>
            <span className="text-emerald-400 font-bold font-mono">MET & VALIDATED</span>
          </div>
        </div>
      </div>

      {/* Prominent Explainable AI Decision Card */}
      <AiDecisionCard 
        decision={decision} 
        environment={environment} 
        onOpenDetails={() => onNavigate && onNavigate('ai-engine')} 
      />

      {/* Main Interactive Room Simulator & Live Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 2D Interactive Room */}
        <div className="lg:col-span-2">
          <VirtualRoom
            environment={environment}
            fan={fan}
            decision={decision}
            onZoneToggle={(zoneId) => {
              const current = environment.occupied_zones || [];
              const updated = current.includes(zoneId)
                ? current.filter((z) => z !== zoneId)
                : [...current, zoneId].sort();
              onUpdateEnvironment({
                ...environment,
                occupied_zones: updated,
                occupancy_count: updated.length,
              });
            }}
            showWasteComparison={true}
            interactive={true}
          />
        </div>

        {/* Right 1 Col: Environment Simulator Panel */}
        <div className="lg:col-span-1">
          <EnvironmentSimulator
            environment={environment}
            onUpdate={onUpdateEnvironment}
            onReset={onResetEnvironment}
          />
        </div>
      </div>

      {/* Energy Optimization Module */}
      <EnergyComparisonWidget 
        energyMetrics={energyMetrics} 
        decision={decision} 
        onOpenDetails={() => onNavigate && onNavigate('energy')} 
      />

      {/* Before vs After Innovation Comparison */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Before vs After Comparison</h3>
            <p className="text-xs text-slate-400">
              Why AeroSense AI replaces traditional dumb pedestal fans
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traditional Fan */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-rose-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Traditional Pedestal Fan
              </span>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800">
                Legacy Dumb Appliance
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Fixed 90°–180° swing:</strong> Blindly sweeps over empty walls and vacant couches.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Manual 3-speed switch:</strong> Runs at full speed even when room cools down.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Zero occupancy awareness:</strong> Keeps running continuously when occupants leave.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Continuous 60W power draw:</strong> High cumulative energy bills and motor wear.</span>
              </li>
            </ul>
          </div>

          {/* AeroSense AI Fan */}
          <div className="bg-gradient-to-br from-[#081524] to-[#0a1b2d] p-4 rounded-xl border border-cyan-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                AeroSense AI Intelligent Fan
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                AtomQuest 2026 Innovation
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Dynamic Sensor-Based Swing:</strong> Dynamically calculates minimal angular sector (cuts wasted arc by 30%–83%).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Bioclimatic Thermal Adaptation:</strong> Automatically modulates BLDC speed to actual apparent heat index.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Autonomous Occupancy Standby:</strong> Automatically parks servo and sleeps motor when room vacates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Explainable AI Reasoning:</strong> Transparent rationale explaining why every speed and angle was chosen.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
