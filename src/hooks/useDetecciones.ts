import { useState, useEffect, useCallback } from 'react';
import { DeteccionItem } from '../types';
import { SAMPLE_DETECCIONES } from '../sampleData';

const FIREBASE_RTDB_URL = 'https://chatbot-ug-37ee9-default-rtdb.firebaseio.com/detecciones.json';

export function useDetecciones() {
  const [rawData, setRawData] = useState<Record<string, DeteccionItem> | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [usingSampleData, setUsingSampleData] = useState<boolean>(false);
  const [manualValorA0, setManualValorA0] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(FIREBASE_RTDB_URL, {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setRawData(data);
          setIsOnline(true);
          setUsingSampleData(false);
          setIsConnecting(false);
          return;
        }
      }

      // If empty or null response from Firebase, load sample dataset
      setRawData((prev) => prev || SAMPLE_DETECCIONES);
      setIsOnline(true);
      setUsingSampleData(true);
    } catch (err) {
      console.warn('Firebase RTDB connection error, using local fallback:', err);
      setRawData((prev) => prev || SAMPLE_DETECCIONES);
      setIsOnline(false);
      setUsingSampleData(true);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Transform raw data dictionary to array sorted chronologically descending
  const items: DeteccionItem[] = rawData
    ? Object.entries(rawData)
        .filter((entry): entry is [string, DeteccionItem] => typeof entry[1] === 'object' && entry[1] !== null)
        .map(([key, val]) => ({
          ...val,
          id: val.id || key,
        }))
        .reverse()
    : [];

  // Compute latest water level
  const latestWaterItem = items.find((i) => i.valor_a0 !== undefined);
  const currentA0 = manualValorA0 !== null ? manualValorA0 : latestWaterItem?.valor_a0 ?? 285;

  // Compute latest activity label
  const latestItem = items[0];
  const lastEventText = latestItem
    ? `${latestItem.evento === 'agua_detectada' ? 'Agua' : 'Movimiento'} (${latestItem.sensor_id || 'Sensor'}) - ${latestItem.fecha_hora || 'Reciente'}`
    : 'Esperando datos...';

  const resetToLiveData = () => {
    setManualValorA0(null);
  };

  return {
    items,
    currentA0,
    lastEventText,
    isOnline,
    isConnecting,
    usingSampleData,
    fetchData,
    setManualValorA0,
    resetToLiveData,
    isManualSimulated: manualValorA0 !== null,
  };
}
