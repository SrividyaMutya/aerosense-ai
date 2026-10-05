import React from 'react';
import { 
  Wind, 
  Cpu, 
  Zap, 
  Heart, 
  BarChart3, 
  Layers, 
  PlayCircle, 
  Radio, 
  ShieldCheck, 
  SlidersHorizontal,
  Box,
  Compass
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wsStatus, 
  operatingMode, 
  comfortScore,
  onOpenDemo 
}) {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: Compass },
    { id: 'room-simulator', label: 'Room Simulator', icon: Box },
    { id: 'ai-engine', label: 'AI Decision Engine', icon: Cpu },
    { id: 'energy', label: 'Energy Optimization', icon: Zap },
    { id: 'comfort-memory', label: 'Comfort Memory', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'scenarios', label: 'Scenarios', icon: SlidersHorizontal },
    { id: 'architecture', label: 'Product Architecture', icon: Layers },
    { id: 'feasibility', label: 'Prototype Feasibility', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding & Status Row */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070b12] rounded-[10px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  AeroSense AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  AtomQuest 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligent Adaptive Airflow System • Track 1: Fan
              </p>
            </div>
          </div>

          {/* Right Status Badges & Demo Pitch Button */}
          <div className="flex items-center space-x-3">
            {/* WS Live Indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-mono text-[11px] text-slate-300">
                {wsStatus === 'connected' ? 'LIVE (10Hz)' : 'CONNECTING'}
              </span>
            </div>

            {/* Mode Indicator */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-xs">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-300 font-medium">{operatingMode}</span>
            </div>

            {/* Comfort Score Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs">
              <span className="text-slate-400">Comfort:</span>
              <span className="font-bold text-emerald-400 font-mono">{comfortScore || 85}/100</span>
            </div>

            {/* Presentation Pitch Demo Mode Button */}
            <button
              onClick={onOpenDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Pitch Demo Tour</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
