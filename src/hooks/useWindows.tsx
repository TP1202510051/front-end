import { useState, useEffect, useCallback } from 'react';
import { getWindowsByProjectId, updateWindowName, deleteWindow } from '@/services/windows.service';
import type { AppWindow } from '@/models/windowModel';

export function useWindows(projectId: string, setIsSaving?: (saving: boolean) => void) {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<AppWindow | null>(null);

  useEffect(() => {
    const loadWindows = async () => {
      try {
        const data = await getWindowsByProjectId(Number(projectId));
        setWindows(data);
      } catch (err) {
        console.error('Error al obtener ventanas:', err);
      }
    };
    loadWindows();
  }, [projectId]);

  const updateWindow = useCallback(async (win: AppWindow, newName: string) => {
    setIsSaving?.(true);
    try {
      await updateWindowName(win.id.toString(), newName);
      setWindows((prev) =>
        prev.map((w) => (w.id === win.id ? { ...w, name: newName } : w))
      );
      return { ...win, name: newName };
    } finally {
      setIsSaving?.(false);
    }
  }, [setIsSaving]);

  const removeWindow = useCallback(async (win: AppWindow) => {
    setIsSaving?.(true);
    try {
      await deleteWindow(win.id.toString());
      setWindows((prev) => prev.filter((w) => w.id !== win.id));
    } finally {
      setIsSaving?.(false);
    }
  }, [setIsSaving]);

  return { windows, selectedWindow, setSelectedWindow, setWindows, updateWindow, removeWindow };
}
