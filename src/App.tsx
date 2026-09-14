import React, { useState, useMemo } from 'react';
import { useDetecciones } from './hooks/useDetecciones';
import { Header } from './components/Header';
import { CityWaterAnimation } from './components/CityWaterAnimation';
import { GeminiAnalysis } from './components/GeminiAnalysis';
import { WaterLevelChart } from './components/WaterLevelChart';
import { EventsTable } from './components/EventsTable';
import { MetricCards } from './components/MetricCards';
import { FilterState, DeteccionItem } from './types';
import { ShieldCheck, MapPin, Radio } from 'lucide-react';

export default function App() {
  const {
    items,
    currentA0,
    lastEventText,
    isOnline,
    isConnecting,
    usingSampleData,
    fetchData,
    setManualValorA0,
    resetToLiveData,
    isManualSimulated,
  } = useDetecciones();

  const [filters, setFilters] = useState<FilterState>({
    date: '',
    time: '',
    type: 'todos',
  });

  // Apply filters identically to original logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Date filter (starts with YYYY-MM-DD)
      if (filters.date && (!item.fecha_hora || !item.fecha_hora.startsWith(filters.date))) {
        return false;
      }
      // Time or text search filter
      if (
        filters.time &&
        (!item.fecha_hora || !item.fecha_hora.toLowerCase().includes(filters.time.toLowerCase()))
      ) {
        return false;
      }
      // Sensor event type filter
      if (filters.type !== 'todos' && item.evento !== filters.type) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  const handleResetFilters = () => {
    setFilters({
      date: '',
      time: '',
      type: 'todos',
    });
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Background ambient lighting accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-96 bg-gradient-to-b from-sky-100/70 via-blue-50/40 to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-8">
        {/* Top Notification Banner if in simulation / demo mode */}
        {isManualSimulated && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm sm:text-base font-semibold">
                Modo Simulación Activo: Estás probando la animación con nivel A0 manual ({currentA0}/500)
              </span>
            </div>
            <button
              type="button"
              onClick={resetToLiveData}
              className="text-xs sm:text-sm font-bold bg-white text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100/70 transition-colors shadow-2xs"
            >
              Volver a Datos Reales
            </button>
          </div>
        )}

        {/* 1. Header with FENOMENO DEL NINO Title */}
        <Header
          isOnline={isOnline}
          isConnecting={isConnecting}
          onRefresh={fetchData}
          usingSampleData={usingSampleData}
        />

        {/* 2. City Skyline SVG & Animated Water Level Graphic: Inundación Urbana */}
        <CityWaterAnimation
          valorA0={currentA0}
          maxValor={500}
          onManualChange={(val) => setManualValorA0(val)}
          isSimulated={isManualSimulated}
        />

        {/* 3. Gemini AI Analysis Section */}
        <GeminiAnalysis items={filteredItems} valorA0={currentA0} />

        {/* 4. Statistical Dashboard Chart for Water Sensor vs Date & Time */}
        <WaterLevelChart items={filteredItems} currentA0={currentA0} />

        {/* 5. Filterable Events History Table */}
        <EventsTable
          items={filteredItems}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Telemetry Metric Cards: Total de Eventos, Nivel Actual (A0), Última Actividad (Moved to bottom) */}
        <MetricCards
          totalCount={filteredItems.length}
          currentA0={currentA0}
          lastEvent={lastEventText}
        />

        {/* Footer */}
        <footer className="pt-6 pb-4 border-t border-slate-200 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              Guayaquil, Ecuador (Río Guayas & Estero Salado)
            </span>
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600" />
              Red de Sensores IoT Hidrométricos y PIR
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Monitoreo y Prevención de Inundaciones
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Sistema de Monitoreo Ambiental Guayaquil • Interfaz en fondo blanco de alta legibilidad
          </p>
        </footer>
      </main>
    </div>
  );
}
