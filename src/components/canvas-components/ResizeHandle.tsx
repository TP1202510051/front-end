import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  id: string;
  className?: string; // Para posicionarla (ej: 'top-0 right-0')
}

export function ResizeHandle({ id, className }: ResizeHandleProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full -m-2 z-10 p-1',
        className,
      )}
      // Detenemos la propagación del clic para no deseleccionar el componente padre
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    />
  );
}
