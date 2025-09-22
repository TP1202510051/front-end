import { useState, useEffect, useCallback } from 'react';
import { getLatestCodeByWindowId } from '@/services/code.service';
import { toast } from 'react-toastify';

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
      toast.error(`Error al obtener código: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  return { liveCode, setLiveCode, fetchCode };
}
