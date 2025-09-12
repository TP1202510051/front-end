import { useState, useCallback } from 'react';
import { createWindow } from '@/services/windows.service';
import type { AppWindow } from '@/models/windowModel';

export function useCreateWindow(projectId: string, setIsSaving?: (saving: boolean) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [windowName, setWindowName] = useState('');

  const create = useCallback(async (): Promise<AppWindow | null> => {
    if (!windowName.trim()) return null;
    setIsSaving?.(true);
    try {
      const result = await createWindow(Number(projectId), windowName);
      if (!result) return null;

      return {
        id: result.id,
        name: result.name,
        createdAt: result.createdAt,
        projectId: result.projectId.toString(),
      };
    } catch (err) {
      console.error('Error al crear ventana:', err);
      return null;
    } finally {
      setIsSaving?.(false);
    }
  }, [projectId, windowName, setIsSaving]);

  return { isOpen, setIsOpen, windowName, setWindowName, create };
}
