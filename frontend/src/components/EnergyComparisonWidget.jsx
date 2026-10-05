import React from 'react';
import { Zap, TrendingDown, DollarSign, Award, Info, AlertTriangle, ArrowRight } from 'lucide-react';

export default function EnergyComparisonWidget({ energyMetrics, decision, onOpenDetails }) {
  const currentWatts = energyMetrics?.current_power_watts ?? 18.5;
  const tradWatts = energyMetrics?.traditional_power_watts ?? 60.0;
  const instantSavedPercent = energyMetrics?.instant_power_saved_percent ?? 69.2;
  const dailyTradKwh = energyMetrics?.daily_traditional_kwh ?? 0.96;
  const dailyAeroKwh = energyMetrics?.daily_aerosense_kwh ?? 0.62;
  const dailySavedKwh = energyMetrics?.daily_saved_kwh ?? 0.34;
  const dailySavedPercent = energyMetrics?.daily_saved_percent ?? 35.4;
  const rupeeSavings = energyMetrics?.estimated_annual_rupee_savings ?? 1054;
  const swingReduction = decision?.swing_coverage_reduction_percent ?? 50.0;

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Energy & Power Optimization</h3>
            <p className="text-[11px] text-slate-400">Simulated motor affinity law & narrowed swing conservation</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Disclaimer Tag */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Estimated / Simulated
          </span>

          {onOpenDetails && (
            <button
              onClick={onOpenDetails}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <span>Open Energy Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Comparison Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Instant Power */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            AeroSense Draw
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">
              {currentWatts}
            </span>
            <span className="text-xs text-slate-400 font-bold">W</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            vs 60.0W traditional
          </span>
        </div>

        {/* Daily Energy Consumption */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Daily Usage (16h)
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {dailyAeroKwh}
            </span>
            <span className="text-xs text-slate-400 font-bold">kWh</span>
          </div>
          <span className="text-[10px] text-emerald-500/80 block mt-0.5">
            Saved: {dailySavedKwh} kWh/day
          </span>
        </div>

        {/* Energy Savings % */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Net Energy Saved
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">
              {dailySavedPercent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Avg daily reduction
          </span>
        </div>

        {/* Unnecessary Swing Reduction */}
        <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Wasted Arc Saved
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-extrabold text-sky-400 font-mono">
              {swingReduction}%
            </span>
          </div>
          <span className="text-[10px] text-sky-400/80 block mt-0.5">
            Eliminates empty swing
          </span>
        </div>
      </div>

      {/* Side-by-Side Visual Bar Comparison */}
      <div className="bg-[#090e18] p-4 rounded-xl border border-slate-800/80 mb-3">
        <div className="text-xs font-semibold text-slate-300 mb-2.5">
          Daily Consumption Comparison (16h Operational Day)
        </div>

        <div className="space-y-3 text-xs">
          {/* Traditional Fan */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Traditional Continuous Fan (Fixed 180° swing)</span>
              <span className="font-mono text-rose-400 font-bold">{dailyTradKwh} kWh</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-full rounded-full" />
            </div>
          </div>

          {/* AeroSense AI Fan */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span className="text-cyan-300 font-medium">AeroSense AI Adaptive System</span>
              <span className="font-mono text-emerald-400 font-bold">{dailyAeroKwh} kWh (-{dailySavedPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (dailyAeroKwh / dailyTradKwh) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Annual Tariff Saving Estimate & Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 gap-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Estimated annual utility saving: <strong className="text-emerald-300 font-mono">₹{rupeeSavings}/year</strong> per fan (@ ₹8.50/kWh).
          </span>
        </div>
        <span className="text-[10px] text-slate-500 italic">
          Preliminary model estimates subject to physical validation.
        </span>
      </div>
    </div>
  );
}
