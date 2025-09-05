import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { CanvasComponent } from '../../stores/canvasStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { HeroSection } from './HeroSection';
import { ProductGrid } from './ProductGrid';
import { cn } from '@/lib/utils';
import { ResizeHandle } from './ResizeHandle';

interface DraggableProps {
  component: CanvasComponent;
}

// Este componente "Renderer" interno es clave para la seguridad de tipos
const ComponentRenderer = ({ component }: { component: CanvasComponent }) => {
  switch (component.type) {
    case 'HeroSection':
      return <HeroSection {...component.props} />;
    case 'ProductGrid':
      return <ProductGrid {...component.props} />;
    default: {
      // Esto previene errores si se añade un nuevo tipo y no se maneja aquí
      return null;
    }
  }
};

const handlePositions = [
  { id: 'tl', className: 'top-0 left-0 cursor-nwse-resize' }, // top-left
  { id: 't', className: 'top-0 left-1/2 -translate-x-1/2 cursor-ns-resize' }, // top
  { id: 'tr', className: 'top-0 right-0 cursor-nesw-resize' }, // top-right
  { id: 'l', className: 'top-1/2 left-0 -translate-y-1/2 cursor-ew-resize' }, // left
  { id: 'r', className: 'top-1/2 right-0 -translate-y-1/2 cursor-ew-resize' }, // right
  { id: 'bl', className: 'bottom-0 left-0 cursor-nesw-resize' }, // bottom-left
  { id: 'b', className: 'bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize' }, // bottom
  { id: 'br', className: 'bottom-0 right-0 cursor-nwse-resize' }, // bottom-right
];

const Draggable = ({ component }: DraggableProps) => {
  const { selectedComponentId, selectComponent } = useCanvasStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: component.id,
  });

  const isSelected = selectedComponentId === component.id;
  const style: React.CSSProperties = {
    position: 'absolute',
    top: component.position.y,
    left: component.position.x,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectComponent(component.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        'outline-none', // Quitamos el outline por defecto del drag
        isSelected && 'ring-2 ring-offset-2 ring-blue-500 ring-offset-gray-800',
      )}
    >
      <ComponentRenderer component={component} />
      {isSelected && (
        <>
          {handlePositions.map((handle) => (
            <ResizeHandle
              key={handle.id}
              id={`${component.id}-handle-${handle.id}`}
              className={handle.className}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Draggable;
