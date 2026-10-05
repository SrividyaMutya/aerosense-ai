import React, { useState } from 'react';
import { 
  Zap, 
  TrendingDown, 
  DollarSign, 
  BarChart2, 
  ShieldAlert, 
  Award, 
  Layers, 
  Sliders, 
  Leaf, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export default function EnergyPage({ energyMetrics, decision }) {
  // Interactive what-if calculator state
  const [hoursPerDay, setHoursPerDay] = useState(16);
  const [tariffRate, setTariffRate] = useState(8.5); // ₹/kWh
  const [fanCount, setFanCount] = useState(1);
  const [targetSpeed, setTargetSpeed] = useState(decision?.recommended_speed ?? 55);

  // Live decision metrics fallback
  const currentSpeed = targetSpeed;
  const swingSpan = decision?.recommended_swing_span ?? 40.0;
  const swingReduction = decision?.swing_coverage_reduction_percent ?? 77.8;

  // Power model calculations
  // Traditional fan: 60W flat (55W motor + 5W mechanical gearbox)
  const tradPowerWatts = 60.0;
  // AeroSense AI fan: BLDC motor affinity scaling + servo pan power
  const bldcPowerWatts = currentSpeed > 0 ? 2.0 + 34.0 * Math.pow(currentSpeed / 100.0, 2.4) : 2.0;
  const servoWatts = currentSpeed > 0 ? 2.5 * (swingSpan / 180.0) : 0;
  const aeroPowerWatts = Math.round((bldcPowerWatts + servoWatts) * 10) / 10;

  // Instantaneous power savings
  const instantSavedWatts = Math.max(0, Math.round((tradPowerWatts - aeroPowerWatts) * 10) / 10);
  const instantSavedPercent = Math.round(((tradPowerWatts - aeroPowerWatts) / tradPowerWatts) * 1000) / 10;

  // Daily energy consumption (kWh)
  const dailyTradKwh = Math.round(((tradPowerWatts * hoursPerDay) / 1000.0) * fanCount * 1000) / 1000;
  const dailyAeroKwh = Math.round(((aeroPowerWatts * hoursPerDay) / 1000.0) * fanCount * 1000) / 1000;
  const dailySavedKwh = Math.round(Math.max(0, dailyTradKwh - dailyAeroKwh) * 1000) / 1000;
  const dailySavedPercent = dailyTradKwh > 0 ? Math.round((dailySavedKwh / dailyTradKwh) * 1000) / 10 : 0;

  // Annual financial calculations in INR (₹)
  const annualTradBill = Math.round(dailyTradKwh * 365 * tariffRate);
  const annualAeroBill = Math.round(dailyAeroKwh * 365 * tariffRate);
  const annualSavedRupees = Math.max(0, annualTradBill - annualAeroBill);

  // Environmental impact: 0.82 kg CO2 per kWh (CEA Indian Grid average emission factor)
  const annualCo2SavedKg = Math.round(dailySavedKwh * 365 * 0.82);

  // 24-Hour Comparative Power Demand dataset
  const powerCurveData = [
    { time: '00:00', traditional: 60, aerosense: 10 },
    { time: '02:00', traditional: 60, aerosense: 8 },
    { time: '04:00', traditional: 60, aerosense: 6 },
    { time: '06:00', traditional: 60, aerosense: 12 },
    { time: '08:00', traditional: 60, aerosense: 22 },
    { time: '10:00', traditional: 60, aerosense: Math.round(aeroPowerWatts * 0.9) },
    { time: '12:00', traditional: 60, aerosense: Math.round(aeroPowerWatts * 1.1) },
    { time: '14:00', traditional: 60, aerosense: aeroPowerWatts },
    { time: '16:00', traditional: 60, aerosense: Math.round(aeroPowerWatts * 0.95) },
    { time: '18:00', traditional: 60, aerosense: 24 },
    { time: '20:00', traditional: 60, aerosense: 18 },
    { time: '22:00', traditional: 60, aerosense: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Energy Optimization & Interactive Cost Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AtomQuest 2026 Energy Suite • Aerodynamic fan affinity power scaling and what-if utility simulation
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-xl text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Notice: Estimated / Simulated for SIL Prototype</span>
        </div>
      </div>

      {/* Interactive What-If Parameter Controls Panel */}
      <div className="bg-[#111827] rounded-2xl border border-emerald-500/40 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Utility & Facility What-If Calculator</h3>
              <p className="text-xs text-slate-400">Tweak operating hours, electricity tariff, and building scale to project compound savings</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full font-bold">
            Live Math Engine: ACTIVE
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[#090e18] border border-slate-800 mb-5">
          {/* Fan Speed Duty */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Fan Speed Duty:</span>
              <span className="font-mono text-cyan-400 font-bold">{targetSpeed}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={targetSpeed}
              onChange={(e) => setTargetSpeed(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Draw: {aeroPowerWatts}W (vs 60W)
            </span>
          </div>

          {/* Daily Run Hours */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Daily Operating Time:</span>
              <span className="font-mono text-emerald-400 font-bold">{hoursPerDay}h / day</span>
            </div>
            <input
              type="range"
              min="4"
              max="24"
              step="1"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Range: 4h (Part-time) to 24h (Continuous)
            </span>
          </div>

          {/* Electricity Tariff */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Tariff Rate (₹/kWh):</span>
              <span className="font-mono text-amber-400 font-bold">₹{tariffRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="16.0"
              step="0.5"
              value={tariffRate}
              onChange={(e) => setTariffRate(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Commercial / Residential Tariff
            </span>
          </div>

          {/* Number of Fans */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Fan Fleet Size:</span>
              <span className="font-mono text-sky-400 font-bold">{fanCount} {fanCount === 1 ? 'Fan' : 'Fans'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={fanCount}
              onChange={(e) => setFanCount(parseInt(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Scales building facility footprint
            </span>
          </div>
        </div>

        {/* Dynamic Calculated KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Instant Power Reduction</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {instantSavedWatts}W
              </span>
              <span className="text-xs text-emerald-400/80 font-bold">(-{instantSavedPercent}%)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Drawing {aeroPowerWatts}W vs 60W
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Daily Energy Saved</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-extrabold text-cyan-300 font-mono">
                {dailySavedKwh}
              </span>
              <span className="text-xs text-slate-400 font-bold">kWh / day</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {dailyAeroKwh} kWh vs {dailyTradKwh} kWh trad.
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Annual Rupee Savings</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                ₹{annualSavedRupees.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ year</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              Save {dailySavedPercent}% of annual bill
            </span>
          </div>

          <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Carbon Emission Avoided</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-extrabold text-emerald-300 font-mono">
                {annualCo2SavedKg.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 font-bold">kg CO₂ / yr</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              0.82 kg CO₂/kWh grid factor
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Power Demand Curve Chart */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Diurnal Power Demand Curve: Traditional Fixed 60W vs AeroSense AI (24 Hours)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated 24-hour diurnal curve showing night standby and afternoon adaptive throttling
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">Traditional (60W Flat)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">AeroSense AI Adaptive</span>
            </div>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAero" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="W" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090e18', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="traditional" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTrad)" name="Traditional Fan (Watts)" />
              <Area type="monotone" dataKey="aerosense" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAero)" name="AeroSense AI (Watts)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engineering Principles Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            1. Why Fixed 180° Fans Waste Power
          </h4>
          <p className="leading-relaxed">
            In standard residential and commercial rooms, occupants typically occupy only 25% to 40% of the room perimeter. A traditional mechanical fan gearbox blindly forces the motor head through a full 180° or 90° fixed swing. For 60% of every oscillation period, airflow cools unoccupied walls, curtains, and empty furniture.
          </p>
        </div>

        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            2. The Dual-Vector AeroSense Advantage
          </h4>
          <p className="leading-relaxed">
            AeroSense decouples rotation and speed: it modulates BLDC motor PWM according to actual apparent thermal index (P proportional to RPM^2.4) and clamps digital servo oscillation strictly across the occupant cluster. Combining low RPM with narrowed swing arc compounds savings up to 69% in real-time power!
          </p>
        </div>
      </div>
    </div>
  );
}
