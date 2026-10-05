import React, { useState, useEffect, useRef } from 'react';
import { Users, Wind, AlertCircle, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function VirtualRoom({
  environment,
  fan,
  decision,
  onZoneToggle,
  showWasteComparison = true,
  interactive = true,
}) {
  const [showTraditionalOverlay, setShowTraditionalOverlay] = useState(false);
  const canvasRef = useRef(null);

  const zones = [
    { id: 'A', label: 'Zone A', centerDeg: 45, startDeg: 25, endDeg: 65, color: '#06b6d4' },
    { id: 'B', label: 'Zone B', centerDeg: 75, startDeg: 55, endDeg: 95, color: '#38bdf8' },
    { id: 'C', label: 'Zone C', centerDeg: 105, startDeg: 85, endDeg: 125, color: '#818cf8' },
    { id: 'D', label: 'Zone D', centerDeg: 135, startDeg: 115, endDeg: 155, color: '#a855f7' },
  ];

  const currentAngle = fan?.current_angle ?? 90;
  const swingStart = fan?.swing_start_angle ?? 30;
  const swingEnd = fan?.swing_end_angle ?? 120;
  const speedPercent = fan?.speed_percent ?? 0;
  const isFanOn = fan?.is_on && speedPercent > 0;
  const occupiedZones = environment?.occupied_zones || [];

  // Animated airflow particles on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Room coordinate space
    const width = canvas.width;
    const height = canvas.height;
    const fanX = width / 2;
    const fanY = height - 50;

    // Airflow particles pool
    const particleCount = isFanOn ? Math.max(15, Math.floor(speedPercent * 0.7)) : 0;
    const particles = Array.from({ length: particleCount }, () => ({
      dist: Math.random() * 260,
      angleSpread: (Math.random() - 0.5) * 24, // Beam cone spread in degrees
      speed: (1.5 + Math.random() * 2.5) * (speedPercent / 60),
      size: 1.5 + Math.random() * 2.5,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isFanOn) {
        step += 1;
        // Current fan aim angle in radians
        // Note: Fan 0° is far left (180° standard math), 90° is straight up (90° math), 180° is far right (0° math)
        // Convert fan degrees (0° left to 180° right) to standard canvas angle
        const fanMathRad = (180 - currentAngle) * (Math.PI / 180);

        // Draw animated cone beam
        const gradient = ctx.createRadialGradient(fanX, fanY, 10, fanX, fanY, 280);
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fanX, fanY);
        const spreadRad = (18 * Math.PI) / 180;
        ctx.arc(fanX, fanY, 280, fanMathRad - spreadRad, fanMathRad + spreadRad);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        // Draw moving airflow particles
        particles.forEach((p) => {
          p.dist += p.speed;
          if (p.dist > 280) {
            p.dist = 15;
            p.angleSpread = (Math.random() - 0.5) * 24;
          }

          const particleRad = (180 - (currentAngle + p.angleSpread)) * (Math.PI / 180);
          const px = fanX + Math.cos(particleRad) * p.dist;
          const py = fanY - Math.sin(particleRad) * p.dist;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          const fade = Math.max(0, 1 - p.dist / 280);
          ctx.fillStyle = `rgba(103, 232, 249, ${p.alpha * fade})`;
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentAngle, speedPercent, isFanOn]);

  // Compute SVG arc path for sector visualization
  const getSectorPath = (startDeg, endDeg, radius, cx = 250, cy = 290) => {
    // 0 deg is left (math 180), 180 deg is right (math 0)
    const rStart = (180 - startDeg) * (Math.PI / 180);
    const rEnd = (180 - endDeg) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(rStart);
    const y1 = cy - radius * Math.sin(rStart);
    const x2 = cx + radius * Math.cos(rEnd);
    const y2 = cy - radius * Math.sin(rEnd);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Virtual Room Simulation
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {occupiedZones.length} / 4 Zones Occupied
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive 2D spatial plane with real-time dynamic airflow vectoring
          </p>
        </div>

        {/* Traditional Waste Overlay Toggle */}
        {showWasteComparison && (
          <button
            onClick={() => setShowTraditionalOverlay(!showTraditionalOverlay)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTraditionalOverlay
                ? 'bg-rose-950/60 border-rose-700/80 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {showTraditionalOverlay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTraditionalOverlay ? 'Hide Fixed Waste' : 'Show Fixed 180° Waste'}</span>
          </button>
        )}
      </div>

      {/* Interactive 2D Room Display Container */}
      <div className="relative w-full aspect-[5/3.4] max-h-[440px] bg-[#070b14] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Subtle Room Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Room Perimeter Walls & Labels */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          Wall North (Window)
        </div>
        <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          Wall West
        </div>
        <div className="absolute top-1/2 right-3 translate-y-1/2 rotate-90 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          Wall East (Door)
        </div>

        {/* SVG Visualization Layer */}
        <svg 
          viewBox="0 0 500 340" 
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Traditional Fixed 180° Oscillation Overlay (Translucent Red Wasted Area) */}
          {showTraditionalOverlay && (
            <g className="transition-opacity duration-300">
              <path
                d={getSectorPath(0, 180, 240, 250, 300)}
                fill="rgba(244, 63, 94, 0.08)"
                stroke="rgba(244, 63, 94, 0.3)"
                strokeDasharray="4 4"
              />
              <text x="250" y="80" textAnchor="middle" fill="#fb7185" fontSize="10" fontFamily="sans-serif">
                Fixed 180° Traditional Oscillation (Wasting air on empty areas)
              </text>
            </g>
          )}

          {/* Active AeroSense Adaptive Swing Sector (Cyan/Emerald Highlight) */}
          {fan?.swing_span > 0 && isFanOn && (
            <path
              d={getSectorPath(swingStart, swingEnd, 240, 250, 300)}
              fill="rgba(6, 182, 212, 0.12)"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="1.5"
            />
          )}

          {/* Dynamic Fan Head Pointer Ray */}
          {isFanOn && (
            <line
              x1="250"
              y1="300"
              x2={250 + 240 * Math.cos((180 - currentAngle) * (Math.PI / 180))}
              y2={300 - 240 * Math.sin((180 - currentAngle) * (Math.PI / 180))}
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="opacity-70"
            />
          )}

          {/* Concentric distance range rings */}
          {[100, 180, 250].map((r, i) => (
            <path
              key={r}
              d={`M ${250 - r} 300 A ${r} ${r} 0 0 1 ${250 + r} 300`}
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
        </svg>

        {/* HTML5 Canvas for real-time fluid particle streamlines */}
        <canvas
          ref={canvasRef}
          width={500}
          height={340}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Zone Markers / Occupant Avatars (Interactive click-to-occupy) */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {zones.map((zone) => {
            const isOccupied = occupiedZones.includes(zone.id);
            // Radial position in percentage
            const angleRad = (180 - zone.centerDeg) * (Math.PI / 180);
            const radiusPx = 175; // Distance from fan center
            // Map (250, 300) center to percentage coordinates
            const xPercent = ((250 + Math.cos(angleRad) * radiusPx) / 500) * 100;
            const yPercent = ((300 - Math.sin(angleRad) * radiusPx) / 340) * 100;

            // Check if current fan angle is currently passing this zone
            const isTargetedNow = Math.abs(currentAngle - zone.centerDeg) <= 18 && isFanOn;

            return (
              <div
                key={zone.id}
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex flex-col items-center"
              >
                <button
                  type="button"
                  disabled={!interactive}
                  onClick={() => onZoneToggle && onZoneToggle(zone.id)}
                  title={`Click to toggle occupancy in ${zone.label}`}
                  className={`group relative p-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-center ${
                    isOccupied
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 scale-105'
                      : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  } ${isTargetedNow && isOccupied ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#070b14]' : ''}`}
                >
                  <Users className={`w-5 h-5 transition-transform group-hover:scale-110 ${isOccupied ? 'text-cyan-400' : 'text-slate-600'}`} />

                  {/* Cooling wave ripple when airflow hits occupant */}
                  {isTargetedNow && isOccupied && (
                    <span className="absolute -inset-1 rounded-2xl border border-cyan-400 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Status dot */}
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#070b14] ${
                      isOccupied ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                </button>

                {/* Zone Label Badge */}
                <div className="mt-1 text-center">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isOccupied ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {zone.label}
                  </span>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {isOccupied ? 'Occupied' : 'Empty'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pedestal Fan Unit (Bottom Center) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          {/* Fan Head Assembly (Rotates with current_angle) */}
          <div 
            className="relative transition-transform duration-75 ease-linear"
            style={{
              transform: `rotate(${currentAngle - 90}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Fan Grille Outer Ring */}
            <div className="w-14 h-14 rounded-full border-2 border-cyan-500/80 bg-slate-950/90 shadow-lg shadow-cyan-500/20 flex items-center justify-center relative">
              {/* Spinning Blades inside */}
              <div 
                className={`w-11 h-11 flex items-center justify-center transition-all ${
                  isFanOn ? 'animate-spin' : ''
                }`}
                style={{
                  animationDuration: isFanOn ? `${Math.max(0.12, 1.8 - (speedPercent / 100) * 1.6)}s` : '0s',
                }}
              >
                <Wind className={`w-8 h-8 ${isFanOn ? 'text-cyan-400' : 'text-slate-600'}`} />
              </div>

              {/* Fan Nose Cone */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white shadow-sm" />
            </div>

            {/* Direction Arrow Needle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-400" />
          </div>

          {/* Pedestal Neck & Stand Base */}
          <div className="w-2.5 h-6 bg-gradient-to-b from-slate-600 to-slate-800 mt-1 rounded-sm" />
          <div className="w-12 h-3 bg-slate-800 border border-slate-700 rounded-full shadow-md flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-bold mt-1">
            {currentAngle.toFixed(0)}°
          </span>
        </div>

        {/* Real-time Angle & Reduction Callout */}
        <div className="absolute bottom-3 left-4 z-30 bg-[#0b1120]/90 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono">
          <div className="text-slate-400">
            Swing Span: <span className="text-cyan-300 font-bold">{fan?.swing_span ?? 0}°</span>
          </div>
          <div className="text-slate-400">
            Bounds: <span className="text-slate-200">{fan?.swing_start_angle ?? 0}° → {fan?.swing_end_angle ?? 0}°</span>
          </div>
        </div>

        {/* Unnecessary Swing Reduction Pill */}
        <div className="absolute bottom-3 right-4 z-30 bg-emerald-950/80 backdrop-blur border border-emerald-800/80 rounded-lg px-2.5 py-1.5 text-[11px]">
          <div className="text-emerald-300 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{decision?.swing_coverage_reduction_percent ?? 0}% Swing Saved</span>
          </div>
          <div className="text-[10px] text-emerald-400/80">
            vs Fixed 180° Oscillation
          </div>
        </div>
      </div>

      {/* Interactive Helper Footer */}
      {interactive && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Click any zone icon above (A, B, C, D) to add or remove occupants in real-time.
          </span>
          <span className="font-mono text-slate-500 text-[11px]">
            Target: &gt;30% reduction validated
          </span>
        </div>
      )}
    </div>
  );
}
