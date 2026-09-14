import React from 'react';
import { Activity, Gauge, Clock, ArrowUpRight, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MetricCardsProps {
  totalCount: number;
  currentA0: number;
  lastEvent: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalCount,
  currentA0,
  lastEvent,
}) => {
  const percentage = Math.min(Math.max(Math.round((currentA0 / 500) * 100), 0), 100);
  const isHighRisk = percentage >= 70;
  const isModerateRisk = percentage >= 30 && percentage < 70;

  return (
    <section id="metric-cards-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resumen de Telemetría IoT
          </h3>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Indicadores clave de sensores y actividad en tiempo real
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* 1. Total Eventos */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50/70 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total de Eventos
            </span>
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Activity className="w-5 h-5" />
            </span>
          </div>

          <div id="total-count" className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 tracking-tight relative z-10">
            {totalCount}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
            <span>Registros procesados</span>
            <span className="text-blue-600 font-bold inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Activo
            </span>
          </div>
        </div>

        {/* 2. Nivel Actual (A0) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div
            className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform ${
              isHighRisk ? 'bg-rose-50/70' : isModerateRisk ? 'bg-amber-50/70' : 'bg-sky-50/70'
            }`}
          />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Nivel Actual (A0)
            </span>
            <span
              className={`p-2.5 rounded-2xl border shadow-2xs ${
                isHighRisk
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : isModerateRisk
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-sky-50 text-sky-600 border-sky-100'
              }`}
            >
              <Gauge className="w-5 h-5" />
            </span>
          </div>

          <div
            id="current-a0"
            className={`text-4xl sm:text-5xl font-black mt-3 tracking-tight flex items-baseline gap-2 relative z-10 ${
              isHighRisk ? 'text-rose-600' : isModerateRisk ? 'text-amber-600' : 'text-sky-600'
            }`}
          >
            <span>{currentA0}</span>
            <span className="text-base sm:text-lg text-slate-400 font-bold">/ 500</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
            <span>Sensor hidrométrico</span>
            <span
              className={`font-bold inline-flex items-center gap-1 ${
                isHighRisk ? 'text-rose-600' : isModerateRisk ? 'text-amber-600' : 'text-sky-600'
              }`}
            >
              {percentage}% cota
            </span>
          </div>
        </div>

        {/* 3. Última Actividad */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50/70 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Última Actividad
            </span>
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <Clock className="w-5 h-5" />
            </span>
          </div>

          <div
            id="last-event"
            className="text-base sm:text-lg font-bold text-emerald-800 mt-3 truncate bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3 relative z-10"
            title={lastEvent}
          >
            {lastEvent || 'Esperando datos...'}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-500">
            <span>Última transmisión</span>
            <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sincronizado
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
