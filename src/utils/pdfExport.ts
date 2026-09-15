import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DeteccionItem, FilterState } from '../types';

interface StatsSummary {
  max: number;
  min: number;
  avg: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  totalPoints: number;
}

interface ChartDataExportItem {
  sensorId: string;
  fechaHora: string;
  horaCorta?: string;
  valorA0: number;
  porcentaje: number;
  estado: string;
  superficie: string;
}

/**
 * Renders a high-resolution, pixel-perfect chart image on an offscreen HTML5 canvas
 * with exact data curves, gradient fills, grid lines, threshold markers, and axis labels.
 */
function renderChartToDataURL(
  chartData: ChartDataExportItem[],
  _stats: StatsSummary,
  _currentA0: number
): string {
  if (typeof document === 'undefined') return '';

  const width = 1400;
  const height = 620;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Clean Canvas Background & Border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Plot Layout Coordinates
  const padLeft = 85;
  const padRight = 45;
  const padTop = 60;
  const padBottom = 75;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const maxVal = 500;

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return padTop + plotHeight - (clamped / maxVal) * plotHeight;
  };

  // 2. Chart Title & Legend
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Nivel Analógico de Agua (Sensor A0) vs. Tiempo', padLeft, 36);

  // Legend Items
  ctx.font = '13px Helvetica, Arial, sans-serif';
  let legendX = width - padRight - 380;
  const legendY = 34;

  // Blue Sensor Legend
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(legendX, legendY - 10, 16, 4);
  ctx.fillStyle = '#334155';
  ctx.fillText('Nivel A0', legendX + 22, legendY - 6);

  // Amber Threshold Legend
  legendX += 105;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(legendX, legendY - 10, 16, 4);
  ctx.fillStyle = '#334155';
  ctx.fillText('Precaución (150)', legendX + 22, legendY - 6);

  // Red Threshold Legend
  legendX += 135;
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(legendX, legendY - 10, 16, 4);
  ctx.fillStyle = '#334155';
  ctx.fillText('Crítico (350)', legendX + 22, legendY - 6);

  // 3. Grid Lines & Numeric Y-Axis
  const ySteps = [0, 100, 200, 300, 400, 500];
  ctx.font = '13px Helvetica, Arial, sans-serif';

  ySteps.forEach((val) => {
    const y = getY(val);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotWidth, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText(`${val}`, padLeft - 12, y + 4);
  });

  // 4. Threshold Lines
  // Amber Line (150 pts)
  const yAmber = getY(150);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(padLeft, yAmber);
  ctx.lineTo(padLeft + plotWidth, yAmber);
  ctx.stroke();

  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Umbral Precaución (150)', padLeft + plotWidth - 10, yAmber - 6);

  // Red Line (350 pts)
  const yRed = getY(350);
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padLeft, yRed);
  ctx.lineTo(padLeft + plotWidth, yRed);
  ctx.stroke();

  ctx.fillStyle = '#e11d48';
  ctx.fillText('Umbral Crítico (350)', padLeft + plotWidth - 10, yRed - 6);
  ctx.setLineDash([]); // Reset dash

  // 5. Data Curve & Point Markers
  if (chartData.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No hay mediciones registradas para graficar', width / 2, height / 2);
  } else {
    const points = chartData.map((d, idx) => {
      const x =
        chartData.length === 1
          ? padLeft + plotWidth / 2
          : padLeft + (idx / (chartData.length - 1)) * plotWidth;
      const y = getY(d.valorA0);
      return { x, y, data: d };
    });

    // 5a. Gradient Fill Area Under Curve
    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotHeight);
    areaGrad.addColorStop(0, 'rgba(2, 132, 199, 0.45)');
    areaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.03)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + plotHeight);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padTop + plotHeight);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 5b. Crisp Blue Stroke Line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 5c. Data Points & Numerical Badges
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (chartData.length <= 25) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11.5px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.data.valorA0}`, p.x, p.y - 10);
      }
    });

    // 5d. X-Axis Time / Date Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';

    const maxLabels = Math.min(10, chartData.length);
    const stepInterval = Math.max(1, Math.floor(chartData.length / maxLabels));

    points.forEach((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === points.length - 1;
      const isStep = idx % stepInterval === 0;

      if (isFirst || isLast || isStep) {
        let timeLabel = p.data.horaCorta;
        if (!timeLabel && p.data.fechaHora) {
          const parts = p.data.fechaHora.split(' ');
          timeLabel = parts[1] || parts[0];
        }
        ctx.fillText(timeLabel || `M${idx + 1}`, p.x, padTop + plotHeight + 22);

        // Tick mark
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, padTop + plotHeight);
        ctx.lineTo(p.x, padTop + plotHeight + 5);
        ctx.stroke();
      }
    });
  }

  // 6. Base X-Axis Line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop + plotHeight);
  ctx.lineTo(padLeft + plotWidth, padTop + plotHeight);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a high-quality statistical PDF report with the chart included first
 */
export function exportStatisticalReportPDF(
  chartData: ChartDataExportItem[],
  stats: StatsSummary,
  currentA0: number,
  chartImageBase64?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const fechaGeneracion = now.toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Top header styling
  doc.setFillColor(2, 132, 199); // Sky 600
  doc.rect(0, 0, 210, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FENÓMENO DEL NIÑO - MONITOREO HIDROLÓGICO GUAYAQUIL', 14, 12);

  // Document Title
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Estadístico del Nivel de Agua (Sensor A0)', 14, 26);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    `Fecha de Emisión: ${fechaGeneracion}  |  Red IoT Urbana (Río Guayas & Estero Salado)`,
    14,
    31
  );

  // --- 1. GRÁFICO ESTADÍSTICO (INCLUIDO PRIMERO) ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text('1. GRÁFICO ESTADÍSTICO DE EVOLUCIÓN TEMPORAL', 14, 38);

  const chartX = 14;
  const chartY = 41;
  const chartWidth = 182;
  const chartHeight = 72;

  // Always generate high-fidelity canvas chart image populated with actual chartData points
  const chartImg = renderChartToDataURL(chartData, stats, currentA0) || chartImageBase64;

  if (chartImg) {
    try {
      doc.addImage(chartImg, 'PNG', chartX, chartY, chartWidth, chartHeight);
    } catch (e) {
      console.error('Error embedding chart image in PDF:', e);
    }
  }

  // --- 2. RESUMEN DE INDICADORES CLAVE ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. INDICADORES CLAVE DEL SENSOR', 14, 119);

  const metricsY = 123;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(14, metricsY, 182, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const percentageCurrent = Math.min(Math.round((currentA0 / 500) * 100), 100);
  const trendText =
    stats.trend === 'up'
      ? `Ascenso (+${stats.trendDelta})`
      : stats.trend === 'down'
      ? `Drenando (${stats.trendDelta})`
      : 'Estable';

  // Metrics Columns
  doc.text(`• Nivel Actual A0: ${currentA0} / 500 (${percentageCurrent}% de cota)`, 18, metricsY + 7);
  doc.text(`• Pico Máximo: ${stats.max} / 500 (${Math.round((stats.max / 500) * 100)}%)`, 18, metricsY + 14);
  doc.text(`• Promedio Histórico: ${stats.avg} / 500`, 18, metricsY + 20);

  doc.text(`• Nivel Mínimo: ${stats.min} / 500`, 110, metricsY + 7);
  doc.text(`• Tendencia Inmediata: ${trendText}`, 110, metricsY + 14);
  doc.text(`• Total de Mediciones: ${stats.totalPoints} registros`, 110, metricsY + 20);

  // --- 3. TABLA DE REGISTROS CRONOLÓGICOS ---
  const tableRows = chartData.map((item, idx) => [
    idx + 1,
    item.fechaHora || 'N/A',
    item.sensorId || 'SENSOR-A0',
    `${item.valorA0} / 500`,
    `${item.porcentaje}%`,
    item.estado || 'Normal',
    item.superficie || 'Calzada urbana',
  ]);

  autoTable(doc, {
    startY: 153,
    head: [['#', 'Fecha y Hora', 'Sensor ID', 'Valor A0', 'Cota %', 'Estado', 'Superficie']],
    body: tableRows.length > 0 ? tableRows : [['-', 'Sin registros disponibles', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Sistema de Monitoreo Fenómeno del Niño Guayaquil`,
        14,
        290
      );
    },
  });

  const fileTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  doc.save(`Reporte_Estadistico_Agua_Guayaquil_${fileTimestamp}.pdf`);
}

/**
 * Generates and downloads a filtered events history PDF
 */
export function exportEventsHistoryPDF(items: DeteccionItem[], filters: FilterState) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const fechaGeneracion = now.toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Top header bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FENÓMENO DEL NIÑO - HISTORIAL DE EVENTOS IOT', 14, 12);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Historial de Registros y Detecciones Filtradas', 14, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Fecha de Exportación: ${fechaGeneracion}  |  Registros exportados: ${items.length}`,
    14,
    34
  );

  // Filter criteria box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, 182, 24, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CRITERIOS DE FILTRADO APLICADOS:', 18, 44);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const tipoLabel =
    filters.type === 'todos'
      ? 'Todos los eventos'
      : filters.type === 'agua_detectada'
      ? 'Solo Sensor de Agua'
      : 'Solo Sensor PIR Movimiento';

  doc.text(`• Fecha filtro: ${filters.date ? filters.date : 'Todas las fechas'}`, 18, 51);
  doc.text(`• Búsqueda texto / hora: ${filters.time ? filters.time : 'Sin filtro de hora'}`, 95, 51);
  doc.text(`• Tipo de evento: ${tipoLabel}`, 18, 57);
  doc.text(`• Coincidencias encontradas: ${items.length} registro(s)`, 95, 57);

  // Table rows
  const tableRows = items.map((item, idx) => {
    const eventoLabel =
      item.evento === 'agua_detectada'
        ? 'Agua Detectada'
        : item.evento === 'movimiento_detectado'
        ? 'Movimiento PIR'
        : item.evento || 'Normal';

    return [
      idx + 1,
      item.sensor_id || 'N/A',
      eventoLabel,
      typeof item.valor_a0 === 'number' ? `${item.valor_a0} / 500` : 'N/A',
      item.estado_sensor || 'Normal',
      item.estado_superficie || 'Calzada urbana',
      item.fecha_hora || 'N/A',
    ];
  });

  autoTable(doc, {
    startY: 68,
    head: [['#', 'Sensor ID', 'Evento', 'Valor A0', 'Estado Sensor', 'Superficie', 'Fecha y Hora']],
    body: tableRows.length > 0 ? tableRows : [['-', 'Sin coincidencias con los filtros aplicados', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount} — Exportación de Historial IoT Guayaquil`,
        14,
        290
      );
    },
  });

  const fileTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  doc.save(`Historial_Eventos_Guayaquil_${fileTimestamp}.pdf`);
}
