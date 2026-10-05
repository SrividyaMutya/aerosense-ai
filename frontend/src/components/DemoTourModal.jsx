import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Thermometer, 
  Users, 
  Wind, 
  Zap,
  RotateCcw
} from 'lucide-react';

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Room Is Comfortable & Empty',
    badge: 'Baseline State',
    description: 'Ambient room is at a pleasant 24.0°C with 50% relative humidity. No occupants are present in any zone.',
    aiAction: 'AI places fan in Standby Mode (0% speed, 2.0W draw, head parked at center 90°). Zero wasteful airflow.',
    env: { temperature: 24.0, humidity: 50.0, occupancy_count: 0, occupied_zones: [], comfort_preference: 'Balanced' },
    metrics: { speed: '0%', swing: 'Parked (0° span)', power: '2.0W', wasteSaved: '100%' }
  },
  {
    step: 2,
    title: 'Temperature Rises (Heat Wave)',
    badge: 'Ambient Trigger',
    description: 'Afternoon heat drives ambient temperature up to 33.5°C with 65% humidity (Apparent heat index reaches 38°C).',
    aiAction: 'AI detects high thermal stress, but because room remains unoccupied, it holds motor in eco standby rather than wasting cooling.',
    env: { temperature: 33.5, humidity: 65.0, occupancy_count: 0, occupied_zones: [], comfort_preference: 'Balanced' },
    metrics: { speed: '0%', swing: 'Parked (0° span)', power: '2.0W', wasteSaved: '100%' }
  },
  {
    step: 3,
    title: 'First Occupant Enters Zone A',
    badge: 'Spatial Trigger',
    description: 'PIR motion sensor detects an occupant sitting at a desk in Zone A (Left quadrant, 30°–60°).',
    aiAction: 'AeroSense instantly awakens. Rather than oscillating across the whole room (180°), it clamps swing to a narrow 30°–60° arc.',
    env: { temperature: 33.5, humidity: 65.0, occupancy_count: 1, occupied_zones: ['A'], comfort_preference: 'Balanced' },
    metrics: { speed: '65%', swing: '30° → 60° (30° span)', power: '16.5W', wasteSaved: '83.3%' }
  },
  {
    step: 4,
    title: 'AI Delivers Targeted Evaporative Cooling',
    badge: 'Speed Modulation',
    description: 'Thermal load evaluation calls for high convective relief to overcome the 38°C heat index.',
    aiAction: 'Fan speed increases to 78% (1130 RPM) focused solely on Zone A. Perceived comfort score rises rapidly from 48 to 82.',
    env: { temperature: 34.0, humidity: 68.0, occupancy_count: 1, occupied_zones: ['A'], comfort_preference: 'Cool' },
    metrics: { speed: '82%', swing: '25° → 65° (40° span)', power: '22.8W', wasteSaved: '77.8%' }
  },
  {
    step: 5,
    title: 'Second Occupant Enters Zone C',
    badge: 'Multi-Zone Expansion',
    description: 'A second person enters and sits across the room on a sofa in Zone C (Right quadrant, 90°–120°).',
    aiAction: 'Dual-sensor trigger detected. AeroSense dynamically computes the minimal bounding angular sector bridging Zone A and Zone C.',
    env: { temperature: 34.0, humidity: 68.0, occupancy_count: 2, occupied_zones: ['A', 'C'], comfort_preference: 'Balanced' },
    metrics: { speed: '80%', swing: '25° → 125° (100° span)', power: '23.4W', wasteSaved: '44.4%' }
  },
  {
    step: 6,
    title: 'Precision Airflow Coverage Without Waste',
    badge: 'Energy Conservation',
    description: 'The fan sweeps smoothly between 25° and 125°, cooling both occupants in Zones A and C while bypassing empty Zone D.',
    aiAction: 'AeroSense saves 44.4% unnecessary swing coverage and 38W of electrical power compared to an un-optimized continuous 60W fan.',
    env: { temperature: 32.5, humidity: 60.0, occupancy_count: 2, occupied_zones: ['A', 'C'], comfort_preference: 'Balanced' },
    metrics: { speed: '72%', swing: '25° → 125° (100° span)', power: '19.2W', wasteSaved: '44.4%' }
  },
  {
    step: 7,
    title: 'Occupants Depart the Room',
    badge: 'Occupancy Vacated',
    description: 'Both occupants stand up and leave the room. PIR motion signals in Zones A and C go LOW.',
    aiAction: 'AeroSense detects vacancy timeout. Instead of running aimlessly for hours, it begins controlled shutdown sequence.',
    env: { temperature: 31.0, humidity: 58.0, occupancy_count: 0, occupied_zones: [], comfort_preference: 'Balanced' },
    metrics: { speed: '20% (Ramping down)', swing: 'Centering', power: '6.5W', wasteSaved: '90%' }
  },
  {
    step: 8,
    title: 'Complete Standby Conservation Engaged',
    badge: 'Final Standby',
    description: 'Room is confirmed empty. Fan motor and oscillation servo return to rest state.',
    aiAction: 'System consumes only 2.0W standby logic power. 100% of wasted cooling eliminated until next occupant arrives.',
    env: { temperature: 30.5, humidity: 55.0, occupancy_count: 0, occupied_zones: [], comfort_preference: 'Balanced' },
    metrics: { speed: '0% (Standby)', swing: 'Parked at 90°', power: '2.0W', wasteSaved: '100%' }
  },
];

export default function DemoTourModal({ isOpen, onClose, onApplyStepState }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Apply step state to simulation whenever step changes
  useEffect(() => {
    if (isOpen && onApplyStepState) {
      onApplyStepState(currentStep.env);
    }
  }, [currentStepIndex, isOpen]);

  // Auto-play timer (advances step every 8 seconds)
  useEffect(() => {
    let timer;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleNext();
            return 8;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSecondsRemaining(8);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setSecondsRemaining(8);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setSecondsRemaining(8);
    setIsPlaying(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col">
        {/* Top Header */}
        <div className="bg-[#0b1120] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  AeroSense AI Pitch Demo Tour
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  AtomQuest 2026 Walkthrough
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8-Stage Interactive Demonstration (Under 2 Minutes)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 py-3 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={step.step}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setSecondsRemaining(8);
                }}
                className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition-all flex items-center justify-center ${
                  idx === currentStepIndex
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 scale-110'
                    : idx < currentStepIndex
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step.step}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Step {currentStepIndex + 1} of {DEMO_STEPS.length}</span>
            {isPlaying && (
              <span className="text-cyan-400 font-bold">({secondsRemaining}s)</span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Step Title & Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">
              {currentStep.badge}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Stage {currentStep.step} / 8
            </span>
          </div>

          <h4 className="text-xl font-bold text-white tracking-tight">
            {currentStep.title}
          </h4>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* AI Action Box */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-cyan-500/30">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
              AI Decision & Actuation Response:
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {currentStep.aiAction}
            </p>
          </div>

          {/* Real-time Metrics Card */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Fan Speed</span>
              <span className="font-bold text-cyan-300 font-mono text-xs">{currentStep.metrics.speed}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Swing Arc</span>
              <span className="font-bold text-slate-200 font-mono text-xs">{currentStep.metrics.swing}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Power Draw</span>
              <span className="font-bold text-amber-400 font-mono text-xs">{currentStep.metrics.power}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Sweep Saved</span>
              <span className="font-bold text-emerald-400 font-mono text-xs">{currentStep.metrics.wasteSaved}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-[#0b1120] px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play (8s/step)'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
              title="Restart Tour from Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-500/20 transition-all"
              >
                <span>Complete Tour</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
