import React from 'react';
import { Activity, Gauge, Clock, Radio, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface HeaderStatsProps {
  totalCount: number;
  currentA0: number;
  lastEvent: string;
  isOnline: boolean;
  isConnecting: boolean;
  onRefresh?: () => void;
  usingSampleData?: boolean;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  totalCount,
  currentA0,
  lastEvent,
  isOnline,
  isConnecting,
  onRefresh,
  usingSampleData = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Sistema de Monitoreo - Guayaquil IoT
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-600 font-medium pl-6.5">
            Detección de Riesgo de Inundación y Seguridad en Tiempo Real
          </p>
        </div>

        {/* Status Badge & Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          <div
            id="status-badge"
            className={`px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold rounded-2xl border flex items-center gap-2.5 transition-all shadow-xs ${
              isConnecting
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>Conectando a Firebase...</span>
              </>
            ) : isOnline ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Sistema en Línea</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Modo Local / Desconectado</span>
              </>
            )}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors shadow-xs"
              title="Actualizar datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* 3 Metric Cards with larger typography and harmonious colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Eventos */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total de Eventos
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="w-5 h-5" />
            </span>
          </div>
          <div id="total-count" className="text-4xl sm:text-5xl font-black text-slate-900 mt-2 tracking-tight">
            {totalCount}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Registros procesados por la red IoT
          </p>
        </div>

        {/* Nivel Actual (A0) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Nivel Actual (A0)
            </span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Gauge className="w-5 h-5" />
            </span>
          </div>
          <div id="current-a0" className="text-4xl sm:text-5xl font-black text-sky-600 mt-2 tracking-tight flex items-baseline gap-2">
            <span>{currentA0}</span>
            <span className="text-base sm:text-lg text-slate-400 font-bold">/ 500</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Lectura analógica sensor hidrométrico
          </p>
        </div>

        {/* Última Actividad */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Última Actividad
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div
            id="last-event"
            className="text-base sm:text-lg font-bold text-emerald-700 mt-3 truncate bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5"
            title={lastEvent}
          >
            {lastEvent || 'Esperando datos...'}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Último reporte transmitido
          </p>
        </div>
      </div>
    </div>
  );
};
