import React from 'react';
import { Waves, Sparkles, BarChart3, History, ChevronLeft, ChevronRight, Hand } from 'lucide-react';

export interface TabItem {
  id: number;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SwipeTabsProps {
  currentTab: number;
  onChangeTab: (newTab: number) => void;
  totalTabs: number;
}

export const TABS: TabItem[] = [
  {
    id: 0,
    label: 'Inundación Urbana & IA',
    badge: 'Principal',
    icon: Waves,
  },
  {
    id: 1,
    label: 'Dashboard Estadístico',
    badge: 'Sensor A0',
    icon: BarChart3,
  },
  {
    id: 2,
    label: 'Historial de Eventos',
    badge: 'Registros',
    icon: History,
  },
];

export const SwipeTabs: React.FC<SwipeTabsProps> = ({
  currentTab,
  onChangeTab,
  totalTabs,
}) => {
  const canGoPrev = currentTab > 0;
  const canGoNext = currentTab < totalTabs - 1;

  const handlePrev = () => {
    if (canGoPrev) onChangeTab(currentTab - 1);
  };

  const handleNext = () => {
    if (canGoNext) onChangeTab(currentTab + 1);
  };

  return (
    <div className="space-y-3">
      {/* Primary Navigation Bar */}
      <div className="bg-white p-2 sm:p-2.5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 w-full md:w-auto p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`relative px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-sky-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`hidden lg:inline-block text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Swipe Chevrons & Step Counter */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto px-2">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span className="text-slate-800 font-extrabold text-sm">
              0{currentTab + 1}
            </span>
            <span className="text-slate-300">/</span>
            <span>0{totalTabs}</span>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1.5 px-2">
            {Array.from({ length: totalTabs }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeTab(idx)}
                aria-label={`Ir al panel ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentTab === idx
                    ? 'w-6 bg-sky-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                canGoPrev
                  ? 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border-slate-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
              title="Panel anterior (Swipe derecha)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                canGoNext
                  ? 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border-slate-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
              title="Siguiente panel (Swipe izquierda)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipe Hint Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-3 font-medium">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Hand className="w-3.5 h-3.5 text-sky-500 animate-bounce" />
          <span>
            <strong className="text-slate-800 font-semibold">Swipe táctil:</strong>{' '}
            Desliza la pantalla hacia la izquierda o derecha para cambiar de panel
          </span>
        </span>
        <span className="hidden sm:inline-block text-slate-400">
          Usa también las flechas del teclado ◀ ▶
        </span>
      </div>
    </div>
  );
};
