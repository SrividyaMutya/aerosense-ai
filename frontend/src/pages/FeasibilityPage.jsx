import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function FeasibilityPage() {
  const bomComponents = [
    { component: 'ESP32-WROOM-32D Development Board', specs: 'Dual-core Xtensa 240MHz, 2.4GHz Wi-Fi + BLE', qty: 1, cost: '₹450 – ₹550' },
    { component: 'DHT22 / AM2302 Precision Sensor', specs: 'Temp (-40 to 80°C ±0.5°C), RH (0-100% ±2%)', qty: 1, cost: '₹280 – ₹350' },
    { component: 'PIR Motion Sensors (HC-SR501 / AM312)', specs: 'Directional 100° cone, adjustable sensitivity', qty: 4, cost: '₹360 – ₹480' },
    { component: 'High-Torque Metal Gear Digital Servo (MG996R)', specs: '180° Pan rotation, 11 kg-cm stall torque', qty: 1, cost: '₹350 – ₹450' },
    { component: '12V Low-Voltage Brushless DC Fan', specs: '120mm / 200mm high-CFM, 4-wire PWM tachometer', qty: 1, cost: '₹600 – ₹900' },
    { component: 'L298N / MOSFET Speed Driver Module', specs: 'Optocoupled high-frequency PWM switching', qty: 1, cost: '₹180 – ₹250' },
    { component: '12V 3A SMPS & 5V/3.3V Step-Down Buck', specs: 'Regulated dual rail power supply', qty: 1, cost: '₹450 – ₹600' },
    { component: 'Pedestal Stand & 3D Printed Pivot Mount', specs: 'PLA/PETG articulating oscillation neck assembly', qty: 1, cost: '₹500 – ₹800' },
  ];

  const buildStages = [
    {
      stage: 'ROUND 1',
      title: 'Software-in-the-Loop Prototype (Current Phase)',
      status: 'COMPLETED & FUNCTIONAL',
      color: 'cyan',
      description: 'Fully simulated 2D virtual room, deterministic bioclimatic decision engine, WebSocket 10Hz telemetry, SQLite persistence, and hardware-ready API contracts.',
      milestones: [
        'Deterministic mathematical comfort model (ASHRAE 55)',
        'Dynamic angular sector clustering algorithm',
        'Interactive 2D room simulation with airflow particle physics',
        'Hardware-agnostic REST and WebSocket endpoints',
      ]
    },
    {
      stage: 'ROUND 2',
      title: 'ESP32 + Benchtop Hardware Integration',
      status: 'PLANNED FOR ROUND 2',
      color: 'blue',
      description: 'Assembling the physical benchtop prototype: wiring DHT22, 4 PIR sensors, MG996R pan servo, and 12V BLDC fan to ESP32 running Arduino C++ firmware.',
      milestones: [
        'Breadboard & perfboard circuit assembly',
        'ESP32 firmware flashing with Wi-Fi HTTP telemetry',
        'Closed-loop testing between physical board and backend API',
        'Servo panning mechanical angle calibration (0°–180°)',
      ]
    },
    {
      stage: 'ROUND 3',
      title: 'Refined Physical Prototype & Wind-Tunnel Testing',
      status: 'PLANNED FOR ROUND 3',
      color: 'indigo',
      description: 'Designing customized 3D-printed articulating gimbal neck, aerodynamic fan shroud, anemometer wind speed validation, and energy meter logging.',
      milestones: [
        'Custom CAD enclosure for electronics & sensors',
        'Anemometer air velocity verification across Zones A–D',
        'Physical power meter logging vs traditional 60W fan',
        'Noise level acoustic measurement (&lt;42 dB target)',
      ]
    },
    {
      stage: 'FINALE',
      title: 'Integrated Consumer Pedestal Fan Product',
      status: 'COMPETITION FINALE',
      color: 'emerald',
      description: 'Full commercial-ready standalone pedestal fan with integrated sensor band, on-device touch display, BLE mobile commissioning, and Matter/smart-home compatibility.',
      milestones: [
        'Injection-molded industrial design',
        'Embedded Edge-AI micro-controller PCB',
        'Seamless smart home assistant integration',
        'Final jury demonstration & pitch',
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Prototype Feasibility & AtomQuest 2026 Round 1 Abstract Prep
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Submission reference document • Technical abstract, preliminary Bill of Materials (BOM), and 4-round execution roadmap
        </p>
      </div>

      {/* Abstract Formulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Problem Card */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-2">
            The Problem
          </span>
          <h3 className="text-base font-bold text-white mb-2">
            Wasted Airflow in Fixed-Oscillation Fans
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conventional pedestal fans oscillate across an unyielding, fixed 90°–180° arc regardless of occupant seating. When only 1 or 2 occupants are present, 40% to 60% of all convective airflow is wasted on empty walls, windows, and vacant furniture, inflating electricity bills while failing to maximize personal comfort.
          </p>
        </div>

        {/* Proposed Solution Card */}
        <div className="bg-[#111827] rounded-2xl border border-cyan-500/40 p-5 shadow-xl">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
            The Solution
          </span>
          <h3 className="text-base font-bold text-white mb-2">
            AeroSense AI Adaptive Airflow System
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            An intelligent pedestal fan combining multi-zone PIR occupancy detection with ambient temperature and humidity sensing. A deterministic decision engine calculates the minimal convex angular sector covering active occupants, restricting servo swing solely to where people sit, while modulating BLDC speed to actual apparent heat index.
          </p>
        </div>

        {/* Validated Target Card */}
        <div className="bg-[#111827] rounded-2xl border border-emerald-500/40 p-5 shadow-xl">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-2">
            The Quantitative Target
          </span>
          <h3 className="text-base font-bold text-emerald-300 mb-2">
            &gt;30% Unnecessary Swing Reduction
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Aim to reduce unnecessary swing coverage by at least 30% compared with fixed full-range oscillation while maintaining airflow coverage for occupied zones, saving an estimated 25%–35% overall energy.
          </p>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-300 font-mono">
            ⚠️ "Target to be validated during physical prototype testing."
          </div>
        </div>
      </div>

      {/* Bill of Materials (BOM) Table */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Preliminary Bill of Materials (BOM) & Cost Estimation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Preliminary estimate for Round 2 physical hardware prototype
            </p>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1 rounded-full border border-cyan-800 font-bold">
            Target Budget: ₹3,000 – ₹5,000 Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090e18] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Item / Component</th>
                <th className="py-2.5 px-3">Specifications</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Estimated Cost (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {bomComponents.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{item.component}</td>
                  <td className="py-2.5 px-3 text-slate-400">{item.specs}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-bold">{item.cost}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 font-bold text-white">
              <tr>
                <td colSpan="3" className="py-3 px-3 uppercase font-mono text-xs text-slate-400">
                  Estimated Total Prototype Cost:
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                  ₹2,920 – ₹4,480
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
          * Note: Preliminary estimate – subject to component selection and local supplier availability.
        </div>
      </div>

      {/* 4-Stage Build Plan Timeline */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Competition 4-Stage Build Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {buildStages.map((stage, idx) => (
            <div
              key={stage.stage}
              className={`bg-[#090e18] p-4 rounded-xl border flex flex-col justify-between ${
                idx === 0
                  ? 'border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{stage.stage}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    idx === 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{stage.title}</h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {stage.description}
                </p>
                <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
                  {stage.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">✓</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
