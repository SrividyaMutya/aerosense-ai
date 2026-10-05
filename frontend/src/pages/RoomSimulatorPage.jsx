import React, { useState } from 'react';
import { Box, Users, Wind, Compass, Sparkles, CheckCircle2, Sliders, Shield } from 'lucide-react';
import VirtualRoom from '../components/VirtualRoom';

export default function RoomSimulatorPage({
  environment,
  fan,
  decision,
  onUpdateEnvironment,
}) {
  const [showTraditional, setShowTraditional] = useState(true);

  const zones = [
    { id: 'A', name: 'Zone A (Desk Corner)', bounds: '30° – 60°', center: '45°' },
    { id: 'B', name: 'Zone B (Center Left)', bounds: '60° – 90°', center: '75°' },
    { id: 'C', name: 'Zone C (Lounge / Sofa)', bounds: '90° – 120°', center: '105°' },
    { id: 'D', name: 'Zone D (Window Area)', bounds: '120° – 150°', center: '135°' },
  ];

  const occupied = environment?.occupied_zones || [];

  const handleToggle = (zoneId) => {
    const updated = occupied.includes(zoneId)
      ? occupied.filter((z) => z !== zoneId)
      : [...occupied, zoneId].sort();
    onUpdateEnvironment({
      ...environment,
      occupied_zones: updated,
      occupancy_count: updated.length,
    });
  };

  const handleClearAll = () => {
    onUpdateEnvironment({
      ...environment,
      occupied_zones: [],
      occupancy_count: 0,
    });
  };

  const handleSelectAll = () => {
    onUpdateEnvironment({
      ...environment,
      occupied_zones: ['A', 'B', 'C', 'D'],
      occupancy_count: 4,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            Interactive 2D Virtual Room Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-zone occupancy detection and dynamic airflow vectoring demonstration
          </p>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Clear All (Empty Room)
          </button>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-medium border border-cyan-700 transition-colors"
          >
            Occupy All Zones (A–D)
          </button>
        </div>
      </div>

      {/* Main Interactive Room Visualizer */}
      <VirtualRoom
        environment={environment}
        fan={fan}
        decision={decision}
        onZoneToggle={handleToggle}
        showWasteComparison={true}
        interactive={true}
      />

      {/* Spatial Geometry Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {zones.map((z) => {
          const isOcc = occupied.includes(z.id);
          return (
            <div
              key={z.id}
              onClick={() => handleToggle(z.id)}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                isOcc
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-[#111827] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono">Zone {z.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isOcc ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isOcc ? 'OCCUPIED' : 'VACANT'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{z.name}</p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Arc: {z.bounds}</span>
                <span>Center: {z.center}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Algorithmic Swing Optimization Explanation Card */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          How AeroSense AI Dynamically Clusters Occupied Zones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-[#090e18] p-3.5 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">1. Spatial Discretization</span>
            The 180° horizontal pan plane is partitioned into 4 discrete angular detection zones (A, B, C, D) mapped to directional PIR / mmWave radar cones.
          </div>
          <div className="bg-[#090e18] p-3.5 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">2. Convex Angular Hull</span>
            When 1 or more zones trigger HIGH, the decision engine calculates start angle as min(Zone bounds) - 5 deg and end angle as max(Zone bounds) + 5 deg.
          </div>
          <div className="bg-[#090e18] p-3.5 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">3. Waste Elimination</span>
            Unnecessary oscillation across unoccupied sectors is eliminated. If only Zone A is seated, swing span shrinks from 180° to 35°, cutting wasted oscillation by 80.5%!
          </div>
        </div>
      </div>
    </div>
  );
}
