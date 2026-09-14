export interface DeteccionItem {
  id?: string;
  sensor_id?: string;
  evento?: string;
  valor_a0?: number;
  estado_sensor?: string;
  estado_superficie?: string;
  fecha_hora?: string;
}

export type EventFilterType = 'todos' | 'agua_detectada' | 'movimiento_detectado';

export interface FilterState {
  date: string;
  time: string;
  type: EventFilterType;
}

export interface WaterStatusInfo {
  percentage: number;
  statusText: string;
  statusColor: 'emerald' | 'amber' | 'rose';
  riskLevel: 'normal' | 'caution' | 'critical';
}
