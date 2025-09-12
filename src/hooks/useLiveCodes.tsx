import { useState, useEffect, useCallback } from 'react';
import { getLatestCodeByWindowId } from '@/services/code.service';

export function useLiveCode(webSocketCode?: string) {
  const [liveCode, setLiveCode] = useState('');

  useEffect(() => {
    if (webSocketCode) setLiveCode(webSocketCode);
  }, [webSocketCode]);

  const fetchCode = useCallback(async (windowId: string) => {
    try {
      const data = await getLatestCodeByWindowId(Number(windowId));
      setLiveCode(data?.code ?? '');
    } catch (err) {
      console.error('Error al obtener código:', err);
    }
  }, []);

  return { liveCode, setLiveCode, fetchCode };
}
