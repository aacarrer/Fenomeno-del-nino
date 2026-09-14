import React from 'react';
import { Search, Calendar, Filter, RotateCcw, Droplet, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { DeteccionItem, EventFilterType, FilterState } from '../types';

interface EventsTableProps {
  items: DeteccionItem[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const EventsTable: React.FC<EventsTableProps> = ({
  items,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <section
      id="events-history-section"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden space-y-0"
    >
      {/* Header & Filter Controls Container */}
      <div className="p-6 sm:p-8 border-b border-slate-100 space-y-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Historial de Eventos
            </h3>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-0.5">
              Registros cronológicos transmitidos por los nodos IoT desplegados
            </p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="self-start sm:self-auto text-sm sm:text-base font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-sky-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Filtros</span>
          </button>
        </div>

        {/* Filter Inputs Grid with larger, accessible fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Date Filter */}
          <div>
            <label
              htmlFor="filter-date"
              className="block text-sm sm:text-base font-semibold text-slate-700 mb-1.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Filtrar por Fecha</span>
            </label>
            <input
              type="date"
              id="filter-date"
              value={filters.date}
              onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all"
            />
          </div>

          {/* Time/Text Search Filter */}
          <div>
            <label
              htmlFor="filter-time"
              className="block text-sm sm:text-base font-semibold text-slate-700 mb-1.5 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscar Fecha/Hora (ej: 09:30)</span>
            </label>
            <input
              type="text"
              id="filter-time"
              placeholder="HH:MM o AAAA-MM-DD"
              value={filters.time}
              onChange={(e) => onFilterChange({ ...filters, time: e.target.value })}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sensor / Event Type Dropdown */}
          <div>
            <label
              htmlFor="filter-type"
              className="block text-sm sm:text-base font-semibold text-slate-700 mb-1.5 flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Tipo de Sensor / Evento</span>
            </label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value as EventFilterType })}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-100 transition-all cursor-pointer"
            >
              <option value="todos">Todos los eventos</option>
              <option value="agua_detectada">Sensor de Agua (Inundación)</option>
              <option value="movimiento_detectado">Sensor PIR (Movimiento)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table Container with larger typography and high contrast */}
      <div className="max-h-[28rem] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/90 text-slate-600 text-xs sm:text-sm font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200 shadow-xs z-10">
            <tr>
              <th scope="col" className="py-4 px-5">Sensor ID</th>
              <th scope="col" className="py-4 px-5">Evento</th>
              <th scope="col" className="py-4 px-5">Valor A0</th>
              <th scope="col" className="py-4 px-5">Estado Sensor</th>
              <th scope="col" className="py-4 px-5">Superficie</th>
              <th scope="col" className="py-4 px-5">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody id="table-body" className="divide-y divide-slate-100 text-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-6 text-center text-slate-500 text-base font-medium">
                  No hay coincidencias con los filtros aplicados
                </td>
              </tr>
            ) : (
              items.map((val, idx) => {
                const isWater = val.evento === 'agua_detectada';
                const isWarning = (val.valor_a0 || 0) >= 350;

                return (
                  <tr
                    key={val.id || idx}
                    className="hover:bg-sky-50/50 transition-colors group"
                  >
                    {/* Sensor ID */}
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 group-hover:bg-white border border-slate-200 px-3 py-1.5 rounded-xl inline-block shadow-2xs">
                        {val.sensor_id || 'N/A'}
                      </span>
                    </td>

                    {/* Evento */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {isWater ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            <Droplet className="w-3.5 h-3.5 text-sky-600" />
                            <span>Agua / Inundación</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Radio className="w-3.5 h-3.5 text-purple-600" />
                            <span>Movimiento PIR</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Valor A0 */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm sm:text-base font-extrabold ${
                            isWarning ? 'text-rose-600' : 'text-sky-700'
                          }`}
                        >
                          {val.valor_a0 !== undefined ? val.valor_a0 : '-'}
                        </span>
                        {val.valor_a0 !== undefined && (
                          <span className="text-xs text-slate-400 font-medium">/ 500</span>
                        )}
                      </div>
                    </td>

                    {/* Estado Sensor */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 text-sm sm:text-base text-slate-700 font-medium">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isWarning ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{val.estado_sensor || '-'}</span>
                      </span>
                    </td>

                    {/* Superficie */}
                    <td className="py-4 px-5">
                      <span className="text-sm sm:text-base text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        {val.estado_superficie || '-'}
                      </span>
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs sm:text-sm text-slate-600 font-semibold">
                        {val.fecha_hora || 'Sin fecha'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
