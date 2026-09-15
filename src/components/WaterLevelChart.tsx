import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import { DeteccionItem } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Droplets,
  AlertTriangle,
  Info,
  Layers,
  FileDown,
  Loader2,
} from 'lucide-react';
import { exportStatisticalReportPDF } from '../utils/pdfExport';

interface WaterLevelChartProps {
  items: DeteccionItem[];
  currentA0: number;
}

interface ChartDataPoint {
  id: string;
  sensorId: string;
  fechaHora: string;
  horaCorta: string;
  valorA0: number;
  porcentaje: number;
  estado: string;
  superficie: string;
}

export const WaterLevelChart: React.FC<WaterLevelChartProps> = ({ items, currentA0 }) => {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      exportStatisticalReportPDF(chartData, stats, currentA0);
    } catch (err) {
      console.error('Error generando gráfico para PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Process and sort water sensor data chronologically
  const chartData: ChartDataPoint[] = useMemo(() => {
    // Filter items with valid numeric valor_a0
    const waterItems = items.filter(
      (item) => typeof item.valor_a0 === 'number' && !isNaN(item.valor_a0)
    );

    // If no explicit water items, return empty
    if (waterItems.length === 0) return [];

    // Sort chronologically ascending (oldest first, newest last)
    const sorted = [...waterItems].sort((a, b) => {
      const timeA = a.fecha_hora ? new Date(a.fecha_hora).getTime() : 0;
      const timeB = b.fecha_hora ? new Date(b.fecha_hora).getTime() : 0;
      return timeA - timeB;
    });

    return sorted.map((item, idx) => {
      let horaCorta = `Punto ${idx + 1}`;
      if (item.fecha_hora) {
        // Extract time or date/time
        const parts = item.fecha_hora.split(' ');
        if (parts.length > 1) {
          // Has Date and Time: e.g. "2025-05-14 09:42:15" -> "09:42"
          const timeParts = parts[1].split(':');
          horaCorta = timeParts.slice(0, 2).join(':');
        } else {
          horaCorta = item.fecha_hora;
        }
      }

      const val = item.valor_a0 ?? 0;
      return {
        id: item.id || `pt-${idx}`,
        sensorId: item.sensor_id || 'SENSOR-A0',
        fechaHora: item.fecha_hora || 'Sin registro temporal',
        horaCorta,
        valorA0: val,
        porcentaje: Math.min(Math.round((val / 500) * 100), 100),
        estado: item.estado_sensor || 'Normal',
        superficie: item.estado_superficie || 'Calzada urbana',
      };
    });
  }, [items]);

  // Compute key statistical indicators
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        max: currentA0,
        min: currentA0,
        avg: currentA0,
        trend: 'stable' as const,
        trendDelta: 0,
        totalPoints: 0,
      };
    }

    const values = chartData.map((d) => d.valorA0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / values.length);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendDelta = 0;
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1].valorA0;
      const prev = chartData[chartData.length - 2].valorA0;
      trendDelta = last - prev;
      if (trendDelta > 5) trend = 'up';
      else if (trendDelta < -5) trend = 'down';
    }

    return { max, min, avg, trend, trendDelta, totalPoints: chartData.length };
  }, [chartData, currentA0]);

  // Custom high-contrast tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload;
      const isCritical = data.valorA0 >= 350;
      const isWarning = data.valorA0 >= 150 && data.valorA0 < 350;

      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {data.sensorId}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {data.horaCorta}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-500">Nivel de Agua A0:</span>
              <span
                className={`text-lg font-black font-mono ${
                  isCritical
                    ? 'text-rose-600'
                    : isWarning
                    ? 'text-amber-600'
                    : 'text-sky-600'
                }`}
              >
                {data.valorA0}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 500</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Cota Alcanzada:</span>
              <span className="text-xs font-bold text-slate-800">
                {data.porcentaje}% de capacidad
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Estado:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isCritical
                    ? 'bg-rose-100 text-rose-700'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {data.estado}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Fecha y Hora:</span>
            <span className="font-mono text-slate-600 font-semibold">{data.fechaHora}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section
      id="water-level-dashboard-chart"
      className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-6"
    >
      {/* Dashboard Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Dashboard Estadístico - Nivel de Agua
              </h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-0.5">
                Comportamiento temporal del sensor hidrométrico A0 (0 a 500) en función de fecha y hora
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Visual Legend & PDF Export */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-600 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
            title="Descargar reporte estadístico en PDF con el gráfico incluido"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                chartType === 'area'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Área Sombreada
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                chartType === 'line'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Línea Pura
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Normal (&lt;150)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Precaución (150-350)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Alerta (&gt;350)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Mini KPI Cards in Dashboard Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Nivel Máximo */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pico Máximo
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {stats.max}{' '}
            <span className="text-xs font-normal text-slate-400">/ 500</span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {Math.round((stats.max / 500) * 100)}% de cota máxima
          </span>
        </div>

        {/* Nivel Promedio */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Promedio Histórico
          </span>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">
            {stats.avg}{' '}
            <span className="text-xs font-normal text-slate-400">/ 500</span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Media ponderada
          </span>
        </div>

        {/* Nivel Mínimo */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Nivel Mínimo
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {stats.min}{' '}
            <span className="text-xs font-normal text-slate-400">/ 500</span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Bajamar registrada
          </span>
        </div>

        {/* Tendencia */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Tendencia Inmediata
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {stats.trend === 'up' ? (
              <>
                <TrendingUp className="w-6 h-6 text-rose-600" />
                <span className="text-2xl sm:text-3xl font-black text-rose-600">
                  +{stats.trendDelta}
                </span>
              </>
            ) : stats.trend === 'down' ? (
              <>
                <TrendingDown className="w-6 h-6 text-emerald-600" />
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {stats.trendDelta}
                </span>
              </>
            ) : (
              <>
                <Minus className="w-6 h-6 text-slate-500" />
                <span className="text-2xl sm:text-3xl font-black text-slate-700">
                  Estable
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            {stats.trend === 'up'
              ? 'Nivel de agua en ascenso'
              : stats.trend === 'down'
              ? 'Nivel de agua drenando'
              : 'Fluctuación controlada'}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-80 sm:h-96 pt-2 bg-white rounded-2xl">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Droplets className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-base font-medium text-slate-600">
              No hay lecturas registradas del sensor de agua con los filtros actuales
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Restablece los filtros para visualizar la serie histórica
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 30, left: -10, bottom: 25 }}
            >
              <defs>
                {/* Vibrant and sophisticated aquatic gradient */}
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.45} />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="horaCorta"
                stroke="#64748b"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                dy={10}
              />

              <YAxis
                domain={[0, 500]}
                stroke="#64748b"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => `${val}`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Reference Lines for Risk Thresholds */}
              <ReferenceLine
                y={350}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Umbral Crítico (350)',
                  position: 'insideTopRight',
                  fill: '#e11d48',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />

              <ReferenceLine
                y={150}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Umbral Precaución (150)',
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />

              {chartType === 'area' && (
                <Area
                  type="monotone"
                  dataKey="valorA0"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#waterGradient)"
                  activeDot={{
                    r: 6,
                    fill: '#0369a1',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              )}

              {chartType === 'line' && (
                <Line
                  type="monotone"
                  dataKey="valorA0"
                  stroke="#0284c7"
                  strokeWidth={3.5}
                  dot={{
                    r: 4,
                    fill: '#0284c7',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#0369a1',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Explanatory Footer Note */}
      <div className="bg-sky-50/70 rounded-2xl p-3.5 sm:p-4 border border-sky-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-sky-900 font-medium leading-relaxed">
          <span className="font-bold">Interpretación de la escala:</span> La escala analógica A0
          mide de 0 a 500 puntos. Valores inferiores a 150 representan cota normal sin anegamiento;
          de 150 a 350 indican advertencia por acumulación pluvial o marea alta; valores superiores a 350
          representan riesgo crítico de desbordamiento en zonas bajas de Guayaquil.
        </div>
      </div>
    </section>
  );
};
