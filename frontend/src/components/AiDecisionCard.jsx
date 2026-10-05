import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, Thermometer, Users, Compass, Zap, Sparkles } from 'lucide-react';

export default function AiDecisionCard({ decision, environment, onOpenDetails }) {
  // Graceful fallback if decision is still loading
  const d = decision || {
    headline: "Targeted Single-Zone Comfort (Zone A)",
    explanation: "One occupant detected in Zone A. AeroSense narrowed swing oscillation to 25° - 65° while modulating airflow for optimal thermal comfort.",
    reasoning_factors: [
      "Moderate ambient warmth: Apparent temp is 28.5°C (comfortable baseline is 23.5°C).",
      "Single occupant located in Zone A: Swing restricted to focused 25° - 65° arc (40° span), cutting wasted swing by 77.8%.",
      "Energy optimization: Drawing 18.5W vs 60.0W for standard fixed fan (69.2% power reduction)."
    ],
    recommended_speed: 55,
    recommended_swing_start: 25.0,
    recommended_swing_end: 65.0,
    recommended_swing_span: 40.0,
    comfort_score: 84,
    energy_mode: "COMFORT BALANCED",
    airflow_intensity: "COMFORT MODERATE",
    swing_coverage_reduction_percent: 77.8,
    personalized_applied: false,
  };

  const {
    headline,
    explanation,
    reasoning_factors,
    recommended_speed,
    recommended_swing_start,
    recommended_swing_end,
    recommended_swing_span,
    comfort_score,
    energy_mode,
    airflow_intensity,
    swing_coverage_reduction_percent,
    personalized_applied,
  } = d;

  return (
    <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#0b1528] rounded-2xl border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                Explainable Decision Engine
              </span>
              {personalized_applied && (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-medium">
                  Personalized Profile Applied
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {headline}
            </h3>
          </div>
        </div>

        {/* Operating & Energy Tag + Open Details Button */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            {energy_mode}
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
            Score: {comfort_score}/100
          </span>

          {onOpenDetails && (
            <button
              onClick={onOpenDetails}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 ml-1"
            >
              <span>Open Full Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Decision Output Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-[#090e18]/80 border border-slate-800/80">
        {/* Fan Speed Output */}
        <div className="flex items-center justify-between md:flex-col md:items-start p-2">
          <span className="text-xs text-slate-400">Recommended Speed</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">
              {recommended_speed}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              ({airflow_intensity})
            </span>
          </div>
        </div>

        {/* Swing Arc Output */}
        <div className="flex items-center justify-between md:flex-col md:items-start p-2 border-t md:border-t-0 md:border-l border-slate-800/80">
          <span className="text-xs text-slate-400">Target Swing Range</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              {recommended_swing_span > 0 ? (
                `${recommended_swing_start.toFixed(0)}° → ${recommended_swing_end.toFixed(0)}°`
              ) : (
                'Parked (90°)'
              )}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              ({recommended_swing_span.toFixed(0)}° Span)
            </span>
          </div>
        </div>

        {/* Unnecessary Swing Reduction Output */}
        <div className="flex items-center justify-between md:flex-col md:items-start p-2 border-t md:border-t-0 md:border-l border-slate-800/80">
          <span className="text-xs text-slate-400">Unnecessary Sweep Saved</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {swing_coverage_reduction_percent}%
            </span>
            <span className="text-[11px] text-emerald-400/80">
              eliminated
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Explanation Summary */}
      <div className="mb-4 text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/60">
        <p className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>{explanation}</span>
        </p>
      </div>

      {/* Breakdown Factors (Transparent deterministic logic trace) */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>Deterministic Rationale Tracing</span>
        </h4>
        <div className="space-y-2">
          {reasoning_factors && reasoning_factors.map((factor, idx) => (
            <div 
              key={idx}
              className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
              <span className="leading-normal">{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
