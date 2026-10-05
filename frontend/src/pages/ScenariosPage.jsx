import React from 'react';
import { SlidersHorizontal, Play, CheckCircle2, Flame, Feather, Moon, Users2, Snowflake, ArrowRight } from 'lucide-react';

export default function ScenariosPage({ onApplyScenario, currentScenarioId, decision, environment }) {
  const scenarios = [
    {
      id: 'hot_room',
      title: 'Scenario 1: Hot Summer Peak',
      badge: 'High Cooling Demand',
      icon: Flame,
      color: 'rose',
      temp: '34.0°C',
      humidity: '70%',
      occupancy: '2 Occupants (Zones A & C)',
      expectedSpeed: '75% – 88% (Turbo Jet)',
      expectedSwing: '25° – 125° (Wide Arc)',
      description: 'Severe ambient thermal load triggers rapid evaporative convective cooling and multi-zone bridging.',
      whyImportant: 'Proves multi-zone convex angular hull logic without wasting airflow on Zone D.',
    },
    {
      id: 'comfortable_room',
      title: 'Scenario 2: Comfortable Mild Room',
      badge: 'Targeted Single-Zone',
      icon: Feather,
      color: 'cyan',
      temp: '26.0°C',
      humidity: '50%',
      occupancy: '1 Occupant (Zone B)',
      expectedSpeed: '40% – 50% (Comfort Moderate)',
      expectedSwing: '55° – 95° (Focused 40°)',
      description: 'Pleasant ambient conditions with a single occupant reading in Zone B.',
      whyImportant: 'Demonstrates pinpoint beam targeting: eliminates 77.8% of unnecessary swing oscillation!',
    },
    {
      id: 'empty_room',
      title: 'Scenario 3: Empty Room Energy Saver',
      badge: 'Zero-Occupancy Standby',
      icon: Moon,
      color: 'slate',
      temp: '31.0°C',
      humidity: '65%',
      occupancy: '0 Occupants (Vacant)',
      expectedSpeed: '0% (Standby Off)',
      expectedSwing: 'Parked at 90° (0° Span)',
      description: 'Room is warm, but occupants have vacated the premises.',
      whyImportant: 'Eliminates phantom cooling waste entirely; fan draws only 2.0W logic standby power.',
    },
    {
      id: 'multi_zone',
      title: 'Scenario 4: Multi-Zone Gathering',
      badge: 'Full Room Blanket',
      icon: Users2,
      color: 'purple',
      temp: '29.5°C',
      humidity: '62%',
      occupancy: '4 Occupants (All Zones A–D)',
      expectedSpeed: '72% – 82% (High Airflow)',
      expectedSwing: '20° – 160° (Full 140°)',
      description: 'Multiple occupants seated across all four corners of the room.',
      whyImportant: 'Automatically detects full-perimeter occupancy and smoothly widens swing span to 140°.',
    },
    {
      id: 'low_temperature',
      title: 'Scenario 5: Chilly Morning',
      badge: 'Low Airflow Circulation',
      icon: Snowflake,
      color: 'blue',
      temp: '21.0°C',
      humidity: '45%',
      occupancy: '1 Occupant (Zone A)',
      expectedSpeed: '18% – 25% (Gentle Breeze)',
      expectedSwing: '25° – 65°',
      description: 'Cool ambient conditions where excessive breeze causes shivering draft discomfort.',
      whyImportant: 'Demonstrates gentle acoustic circulation rather than aggressive cooling.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
          Interactive Hackathon Demonstration Scenarios
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          AtomQuest 2026 Live Validation Suite • 1-click execution to verify rapid adaptive decision responses
        </p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrent = environment?.temperature === (sc.id === 'hot_room' ? 34 : sc.id === 'comfortable_room' ? 26 : sc.id === 'empty_room' ? 31 : sc.id === 'multi_zone' ? 29.5 : 21);

          return (
            <div
              key={sc.id}
              className={`bg-[#111827] rounded-2xl border p-5 shadow-xl transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {sc.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {sc.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1 mb-3">
                  {sc.description}
                </p>

                {/* Simulated Input Conditions */}
                <div className="bg-[#090e18] p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Temp & Humidity:</span>
                    <span className="text-slate-200 font-bold">{sc.temp} • {sc.humidity}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Occupancy:</span>
                    <span className="text-cyan-300 font-bold">{sc.occupancy}</span>
                  </div>
                </div>

                {/* Expected AI Output */}
                <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/40 mb-3 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-cyan-400">
                    <span>Expected Speed:</span>
                    <span className="text-white font-bold">{sc.expectedSpeed}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>Expected Swing:</span>
                    <span className="text-white font-bold">{sc.expectedSwing}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic mb-4">
                  💡 {sc.whyImportant}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onApplyScenario(sc.id)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                  isCurrent
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {isCurrent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active in Simulator</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Scenario Live</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
