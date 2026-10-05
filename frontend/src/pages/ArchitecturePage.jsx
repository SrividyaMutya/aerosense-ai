import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Cpu, 
  Wifi, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Cable,
  ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api';

export default function ArchitecturePage() {
  const [spec, setSpec] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getHardwareSpec().then(setSpec).catch(console.error);
  }, []);

  const handleCopyCode = () => {
    if (spec?.firmware_sample_ino) {
      navigator.clipboard.writeText(spec.firmware_sample_ino);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleJsonPacket = {
    device_id: "ESP32_AEROSENSE_01",
    temperature: 31.4,
    humidity: 68.0,
    pir_zone_a: 1,
    pir_zone_b: 0,
    pir_zone_c: 1,
    pir_zone_d: 0,
    battery_voltage: 3.3,
    rssi: -58
  };

  const sampleResponse = {
    status: "acknowledged",
    actuation_commands: {
      power_relay: true,
      bldc_pwm_duty_percent: 78,
      servo_pan_min_deg: 25.0,
      servo_pan_max_deg: 125.0,
      servo_sweep_active: true,
      target_rpm: 1130
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Hardware-Ready System Architecture & Physical Implementation Blueprint
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          AtomQuest 2026 Round 2 Hardware Integration • Modular Software-in-the-Loop Abstraction Layer
        </p>
      </div>

      {/* Prototype Status Disclaimer */}
      <div className="bg-cyan-950/40 border border-cyan-800/60 p-4 rounded-2xl flex items-start space-x-3 text-xs text-cyan-200">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold mb-0.5">
            Software-in-the-Loop (SIL) Architecture Status:
          </strong>
          This application is a software-in-the-loop prototype running on localhost. Physical hardware is not currently connected to this computer. The architecture is engineered so that when the physical ESP32 microcontroller and sensors are assembled for Round 2, they connect to the exact same REST and WebSocket API endpoints without modifying the dashboard or decision engine.
        </div>
      </div>

      {/* Block Diagram & Flow */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Cable className="w-4 h-4 text-cyan-400" />
          End-to-End System Block Diagram
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Stage 1 */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">01. SENSING LAYER</span>
              <h4 className="text-sm font-bold text-white mb-2">PIR & DHT22 Sensors</h4>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• DHT22: Ambient Temp & RH</li>
                <li>• 4x Directional PIR (Zones A–D)</li>
                <li>• Quadrant angular cones</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              1-Wire & Digital GPIO
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-cyan-500/40 flex flex-col justify-between shadow-lg shadow-cyan-500/5">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">02. MCU TELEMETRY</span>
              <h4 className="text-sm font-bold text-white mb-2">ESP32 Controller</h4>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• Dual Core 240MHz MCU</li>
                <li>• 2.4GHz Wi-Fi Station</li>
                <li>• Packages JSON telemetry packet</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
              HTTP POST /api/hardware
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">03. AI DECISION ENGINE</span>
              <h4 className="text-sm font-bold text-white mb-2">FastAPI Backend</h4>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• Computes Apparent Heat Index</li>
                <li>• Dynamically clamps swing bounds</li>
                <li>• Modulates PWM speed curve</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Closed-Loop JSON Response
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-[#090e18] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">04. PHYSICAL ACTUATION</span>
              <h4 className="text-sm font-bold text-white mb-2">BLDC & Servo Motor</h4>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• 25kHz PWM BLDC Fan Driver</li>
                <li>• MG996R Metal Gear Servo</li>
                <li>• Smooth angular oscillation</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
              Targeted Airflow Delivered
            </div>
          </div>
        </div>
      </div>

      {/* JSON Packet Contracts (ESP32 Ingress & Egress) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ingress Packet */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" />
              POST /api/hardware/sensor-packet (Ingress from ESP32)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Identical format used by both the virtual simulator and the real ESP32 hardware.
          </p>
          <pre className="bg-[#070b14] p-3 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
            {JSON.stringify(sampleJsonPacket, null, 2)}
          </pre>
        </div>

        {/* Egress Response */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Actuation Response Payload (Sent back to ESP32)
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Directly maps to hardware PWM timers and servo duty cycles.
          </p>
          <pre className="bg-[#070b14] p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
            {JSON.stringify(sampleResponse, null, 2)}
          </pre>
        </div>
      </div>

      {/* ESP32 Arduino / C++ Firmware Code Preview */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Round 2 ESP32 C++ / Arduino Firmware Reference
              </h3>
              <p className="text-xs text-slate-400">
                Ready to flash to ESP32-WROOM-32D using Arduino IDE / PlatformIO
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Sketch'}</span>
          </button>
        </div>

        <pre className="bg-[#070b14] p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto">
          {spec?.firmware_sample_ino || '// Loading firmware specification...'}
        </pre>
      </div>
    </div>
  );
}
