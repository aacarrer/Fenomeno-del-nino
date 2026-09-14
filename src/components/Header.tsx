import React from 'react';
import { Waves, CloudRain, RefreshCw, CheckCircle, AlertCircle, Compass } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  isConnecting: boolean;
  onRefresh?: () => void;
  usingSampleData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isConnecting,
  onRefresh,
}) => {
  return (
    <header className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Decorative top accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600" />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          {/* Eyebrow badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              <CloudRain className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              Alerta Climática Costera
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              Guayaquil - Cuenca del Río Guayas
            </span>
          </div>

          {/* Main Title Requested by User */}
          <div className="flex items-center gap-3.5 pt-1">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Waves className="w-7 h-7 sm:w-8 sm:h-8" />
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              FENÓMENO DEL NIÑO
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-600 font-medium pl-1">
            Monitoreo hidrométrico en tiempo real, prevención de anegamiento urbano y sensores IoT
          </p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <div
            id="status-badge"
            className={`px-4 sm:px-5 py-2.5 text-sm sm:text-base font-bold rounded-2xl border flex items-center gap-2.5 transition-all shadow-xs ${
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
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
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
              className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-xs hover:shadow cursor-pointer"
              title="Actualizar datos de telemetría"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
