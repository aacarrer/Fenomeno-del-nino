import React from 'react';
import { AlertTriangle, CheckCircle2, Waves, Droplets, ArrowUpRight } from 'lucide-react';
import { WaterStatusInfo } from '../types';

interface CityWaterAnimationProps {
  valorA0: number;
  maxValor?: number;
  onManualChange?: (val: number) => void;
  isSimulated?: boolean;
}

export const CityWaterAnimation: React.FC<CityWaterAnimationProps> = ({
  valorA0,
  maxValor = 500,
  onManualChange,
  isSimulated = false,
}) => {
  const percentage = Math.min(Math.max(Math.round((valorA0 / maxValor) * 100), 0), 100);

  const getStatusInfo = (): WaterStatusInfo => {
    if (percentage >= 70) {
      return {
        percentage,
        statusText: '¡Alerta Crítica de Inundación!',
        statusColor: 'rose',
        riskLevel: 'critical',
      };
    } else if (percentage >= 30) {
      return {
        percentage,
        statusText: 'Precaución: Nivel Elevado',
        statusColor: 'amber',
        riskLevel: 'caution',
      };
    } else {
      return {
        percentage,
        statusText: 'Sin Riesgo (Nivel Normal)',
        statusColor: 'emerald',
        riskLevel: 'normal',
      };
    }
  };

  const status = getStatusInfo();

  return (
    <section
      id="city-water-section"
      className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6"
    >
      {/* Header section with larger, distinct typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-sky-100 text-sky-600 border border-sky-200 shadow-xs">
              <Waves className="w-6 h-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Inundación Urbana
            </h2>
          </div>
          <p className="text-base sm:text-lg text-slate-600 mt-1.5 font-medium pl-1">
            Simulación dinámica de cota de inundación sobre la silueta urbana de Guayaquil frente al Río Guayas
          </p>
        </div>

        <div className="flex items-center sm:items-end gap-3 self-start sm:self-auto bg-slate-50 border border-slate-200/70 px-5 py-3 rounded-2xl">
          <div className="text-right">
            <span
              id="level-percentage"
              className="text-4xl sm:text-5xl font-black tracking-tight text-sky-600 block leading-none"
            >
              {percentage}%
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Capacidad de Cota
            </span>
          </div>
        </div>
      </div>

      {/* Main Animation Container */}
      <div className="relative w-full h-84 sm:h-96 bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-blue-50/50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {/* Sky Details: Sun & Atmospheric Hue */}
        <div className="absolute top-4 right-16 sm:right-28 w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-400/90 blur-[1px] opacity-80 pointer-events-none" />
        <div className="absolute top-3 right-15 sm:right-27 w-22 h-22 rounded-full bg-amber-200/40 blur-md pointer-events-none" />

        {/* Dynamic Diagnostics Pill with larger, legible typography */}
        <div className="absolute top-5 left-5 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md px-5 py-3 rounded-2xl transition-all duration-300">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
            Diagnóstico de Seguridad
          </span>
          <div className="flex items-center gap-2 mt-1">
            {status.riskLevel === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            ) : status.riskLevel === 'caution' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span
              id="visual-status-text"
              className={`text-base sm:text-lg font-bold ${
                status.statusColor === 'rose'
                  ? 'text-rose-600 animate-pulse'
                  : status.statusColor === 'amber'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {status.statusText}
            </span>
          </div>
        </div>

        {/* Altitude Reference Scale Lines */}
        <div className="absolute top-0 right-4 h-full flex flex-col justify-between py-6 text-right z-20 pointer-events-none select-none">
          <span className="text-xs font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">100% Cota Máx</span>
          <span className="text-xs font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">75% Alerta</span>
          <span className="text-xs font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">50% Medio</span>
          <span className="text-xs font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">25% Bajo</span>
          <span className="text-xs font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">0% Marea</span>
        </div>

        {/* Water Fill Layer with Fluid Oscillating Wave */}
        <div
          id="water-fill"
          className="absolute bottom-0 left-0 w-full transition-all duration-700 ease-out z-15"
          style={{ height: `${percentage}%` }}
        >
          {/* Main Top Wave Crest */}
          <div className="relative w-full h-8 -mt-4 overflow-hidden pointer-events-none">
            {/* Primary wave ripple */}
            <div className="absolute inset-0 w-[200%] h-6 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 opacity-90 rounded-full anime-wave blur-[1px]" />
            {/* Secondary wave ripple */}
            <div className="absolute inset-0 w-[200%] h-6 bg-gradient-to-r from-cyan-200 via-blue-300 to-cyan-200 opacity-60 rounded-full anime-wave-slow -mt-1 blur-[0.5px]" />
          </div>

          {/* Deep Water Gradient Body */}
          <div className="w-full h-full bg-gradient-to-t from-blue-700 via-sky-600/90 to-cyan-500/80 shadow-[inset_0_4px_12px_rgba(255,255,255,0.3)]">
            {/* Water highlights & depth details */}
            <div className="w-full h-full opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        </div>

        {/* Guayaquil Skyline Silhouette SVG (Architectural outline in dark slate-navy for light theme contrast) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1000 350"
          preserveAspectRatio="none"
        >
          {/* Celestial / Moon / Ambient Disc */}
          <circle cx="850" cy="90" r="45" fill="#f59e0b" opacity="0.85" />
          <circle cx="850" cy="90" r="55" fill="#fef3c7" opacity="0.4" />

          {/* Guayaquil Cityscape path (Malecon 2000, Cerro Santa Ana, Lighthouse, Towers) */}
          <path
            fill="#1e293b"
            d="M 0,350 L 0,280 C 30,275 50,250 80,250 C 110,250 120,290 150,290 L 150,210 C 150,190 170,190 170,210 L 170,290 L 220,290 C 250,290 280,180 340,180 C 360,180 370,140 375,140 L 385,140 L 385,110 C 385,105 395,105 395,110 L 395,140 L 405,140 C 420,180 450,300 490,300 C 510,300 520,120 530,120 C 535,120 540,130 540,150 C 545,130 550,150 550,300 C 580,300 580,220 620,220 C 660,220 660,300 690,300 C 720,300 730,230 750,230 C 770,230 780,170 810,170 C 840,170 850,240 880,240 C 910,240 930,260 960,260 C 980,260 990,280 1000,280 L 1000,350 Z"
          />

          {/* Architectural highlights: Santa Ana lighthouse beacon and dome arc */}
          <path
            d="M 380,140 Q 390,135 400,140"
            stroke="#38bdf8"
            strokeWidth="3"
            fill="none"
            opacity="0.9"
          />
          {/* Lighthouse Lantern Top Light */}
          <circle cx="390" cy="105" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        </svg>
      </div>

      {/* Interactive Level Tester / Simulation Controls */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 shadow-sm">
            <Droplets className="w-5 h-5 text-sky-600" />
          </span>
          <div>
            <span className="text-sm font-bold text-slate-800 block">
              Control de Simulación del Nivel (Sensor A0)
            </span>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Ajusta el nivel manualmente para comprobar la animación y las alertas visuales
            </span>
          </div>
        </div>

        {onManualChange && (
          <div className="w-full md:w-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onManualChange(75)}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-sm"
            >
              Normal (15%)
            </button>
            <button
              type="button"
              onClick={() => onManualChange(240)}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors shadow-sm"
            >
              Precaución (48%)
            </button>
            <button
              type="button"
              onClick={() => onManualChange(425)}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors shadow-sm"
            >
              Crítico (85%)
            </button>
            <div className="flex items-center gap-2 pl-2">
              <input
                type="range"
                min="0"
                max="500"
                value={valorA0}
                onChange={(e) => onManualChange(Number(e.target.value))}
                className="w-28 sm:w-36 accent-sky-600 cursor-pointer"
                title="Deslizar para cambiar el nivel"
              />
              <span className="text-xs font-mono font-bold text-slate-700 w-12 text-right">
                {valorA0}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
