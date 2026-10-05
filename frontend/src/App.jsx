import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoTourModal from './components/DemoTourModal';
import CommandCenter from './pages/CommandCenter';
import RoomSimulatorPage from './pages/RoomSimulatorPage';
import DecisionEnginePage from './pages/DecisionEnginePage';
import EnergyPage from './pages/EnergyPage';
import ComfortMemoryPage from './pages/ComfortMemoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScenariosPage from './pages/ScenariosPage';
import ArchitecturePage from './pages/ArchitecturePage';
import FeasibilityPage from './pages/FeasibilityPage';
import { api, connectTelemetryWebSocket } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('command-center');
  const [wsStatus, setWsStatus] = useState('connecting');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Core real-time telemetry state
  const [environment, setEnvironment] = useState({
    temperature: 28.0,
    humidity: 55.0,
    occupancy_count: 1,
    occupied_zones: ['A'],
    comfort_preference: 'Balanced',
    time_of_day: 'Afternoon',
    manual_override: false,
  });

  const [fan, setFan] = useState({
    is_on: true,
    speed_percent: 55,
    rpm_estimate: 820,
    current_angle: 60.0,
    swing_start_angle: 30.0,
    swing_end_angle: 80.0,
    swing_span: 50.0,
    airflow_intensity: 'COMFORT MODERATE',
    is_oscillating: true,
    operating_mode: 'AI Adaptive',
  });

  const [decision, setDecision] = useState(null);
  const [energyMetrics, setEnergyMetrics] = useState(null);

  // Initial data fetch & WebSocket connection
  useEffect(() => {
    // 1. Initial REST fetch
    async function loadInitial() {
      try {
        const [envData, fanData, decData, energyData] = await Promise.all([
          api.getSensors(),
          api.getFanStatus(),
          api.getDecision(),
          api.getEnergy(),
        ]);
        setEnvironment(envData);
        setFan(fanData);
        setDecision(decData);
        setEnergyMetrics(energyData);
      } catch (e) {
        console.error('Initial API load error:', e);
      }
    }
    loadInitial();

    // 2. Real-time WebSocket Stream (10Hz)
    const cleanupWs = connectTelemetryWebSocket(
      (packet) => {
        if (packet.environment) setEnvironment(packet.environment);
        if (packet.fan) setFan(packet.fan);
        if (packet.decision) setDecision(packet.decision);
      },
      (status) => setWsStatus(status)
    );

    // 3. Periodic energy metrics refresh (every 3 seconds)
    const energyInterval = setInterval(async () => {
      try {
        const metrics = await api.getEnergy();
        setEnergyMetrics(metrics);
      } catch (e) {
        // quiet error
      }
    }, 3000);

    return () => {
      cleanupWs();
      clearInterval(energyInterval);
    };
  }, []);

  // Handlers
  const handleUpdateEnvironment = async (newEnv) => {
    setEnvironment(newEnv);
    try {
      const res = await api.updateSensors(newEnv);
      if (res.decision) setDecision(res.decision);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetEnvironment = async () => {
    try {
      const res = await api.resetSimulation();
      setEnvironment(res.environment);
      setDecision(res.decision);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualFanControl = async (cmd) => {
    try {
      const res = await api.controlFan(cmd);
      setFan(res.fan);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyScenario = async (scenarioId) => {
    try {
      const res = await api.runScenario(scenarioId);
      setEnvironment(res.environment);
      setFan(res.fan);
      setDecision(res.decision);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wsStatus={wsStatus}
        operatingMode={fan?.operating_mode || 'AI Adaptive'}
        comfortScore={decision?.comfort_score}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command-center' && (
          <CommandCenter
            environment={environment}
            fan={fan}
            decision={decision}
            energyMetrics={energyMetrics}
            onUpdateEnvironment={handleUpdateEnvironment}
            onResetEnvironment={handleResetEnvironment}
            onManualFanControl={handleManualFanControl}
            onApplyScenario={handleApplyScenario}
            onOpenDemo={() => setIsDemoOpen(true)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'room-simulator' && (
          <RoomSimulatorPage
            environment={environment}
            fan={fan}
            decision={decision}
            onUpdateEnvironment={handleUpdateEnvironment}
          />
        )}

        {activeTab === 'ai-engine' && (
          <DecisionEnginePage
            environment={environment}
            fan={fan}
            decision={decision}
            onUpdateEnvironment={handleUpdateEnvironment}
          />
        )}

        {activeTab === 'energy' && (
          <EnergyPage
            energyMetrics={energyMetrics}
            decision={decision}
          />
        )}

        {activeTab === 'comfort-memory' && (
          <ComfortMemoryPage
            decision={decision}
            environment={environment}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage />
        )}

        {activeTab === 'scenarios' && (
          <ScenariosPage
            onApplyScenario={handleApplyScenario}
            currentScenarioId={environment?.temperature}
            decision={decision}
            environment={environment}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitecturePage />
        )}

        {activeTab === 'feasibility' && (
          <FeasibilityPage />
        )}
      </main>

      {/* Presentation Demo Tour Modal */}
      <DemoTourModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onApplyStepState={handleUpdateEnvironment}
      />

      {/* Professional Engineering Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b1120] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">AeroSense AI</span>
            <span>•</span>
            <span>AtomQuest 2026 (Track 1: Fan)</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">Software-in-the-Loop Prototype</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span>FastAPI Backend: :8008</span>
            <span>•</span>
            <span>Vite React Client: :5188</span>
            <span>•</span>
            <span className="text-emerald-400">WebSocket Live (10Hz)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
