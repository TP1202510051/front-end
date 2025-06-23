import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Artboard from '../../components/canvas-components/Artboard';
import Draggable from '../../components/canvas-components/Draggable';
import { useCanvasStore } from '../../stores/canvasStore';
import Toolbar from '../../components/canvas-components/Toolbar';
import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;

const ARTBOARD_WIDTH = 1280;
const ARTBOARD_HEIGHT = 1800;

const DesignInterface = () => {
  const {
    components,
    updateComponent,
    addComponent,
    activeTool,
    setActiveTool,
    selectComponent,
  } = useCanvasStore();

  const [scale, setScale] = useState(1);
  const artboardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = artboardContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      const scaleX = containerWidth / ARTBOARD_WIDTH;
      const scaleY = containerHeight / ARTBOARD_HEIGHT;

      const newScale = Math.min(scaleX, scaleY) * 0.95;
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const draggableId = active.id as string;

    const scaledDelta = {
      x: delta.x / scale,
      y: delta.y / scale,
    };

    if (draggableId.includes('-handle-')) {
      // Es una manija de redimensionado
      const [componentId, handleId] = draggableId.split('-handle-');
      resizeComponent(componentId, handleId, scaledDelta);
    } else {
      // Es el componente principal, lo movemos
      moveComponent(draggableId, scaledDelta);
    }
  }

  function moveComponent(id: string, delta: { x: number; y: number }) {
    const component = components.find((c) => c.id === id);

    if (!component) return;
    // 1. Calcula la nueva posición "cruda"
    const newRawX = component.position.x + delta.x;
    const newRawY = component.position.y + delta.y;

    // 2. Define los límites máximos para la esquina superior izquierda del componente
    const rightBoundary = ARTBOARD_WIDTH - component.size.width;
    const bottomBoundary = ARTBOARD_HEIGHT - component.size.height;

    // 3. SUJETAR (Clamp): Asegura que la posición cruda esté dentro de los límites.
    const clampedX = Math.max(0, Math.min(newRawX, rightBoundary));
    const clampedY = Math.max(0, Math.min(newRawY, bottomBoundary));

    // 4. AJUSTAR (Snap): Redondea la posición ya restringida a la grilla más cercana.
    const finalX = Math.round(clampedX / GRID_SIZE) * GRID_SIZE;
    const finalY = Math.round(clampedY / GRID_SIZE) * GRID_SIZE;

    updateComponent(id, { position: { x: finalX, y: finalY } }); // Usamos la nueva acción
  }

  function resizeComponent(id: string, handle: string, delta: { x: number; y: number }) {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    let { width, height } = component.size;
    let { x, y } = component.position;

    // Calculamos el nuevo tamaño y posición basado en qué manija se arrastró
    switch (handle) {
      case 'br': // Bottom-right
        width += delta.x;
        height += delta.y;
        break;
      case 'bl': // Bottom-left
        width -= delta.x;
        height += delta.y;
        x += delta.x;
        break;
      case 'tr': // Top-right
        width += delta.x;
        height -= delta.y;
        y += delta.y;
        break;
      case 'tl': // Top-left
        width -= delta.x;
        height -= delta.y;
        x += delta.x;
        y += delta.y;
        break;
      case 't':
        height -= delta.y;
        y += delta.y;
        break;
      case 'b':
        height += delta.y;
        break;
      case 'l':
        width -= delta.x;
        x += delta.x;
        break;
      case 'r':
        width += delta.x;
        break;
    }

    const minSize = GRID_SIZE * 2;
    const newWidth = Math.round(Math.max(width, minSize) / GRID_SIZE) * GRID_SIZE;
    const newHeight = Math.round(Math.max(height, minSize) / GRID_SIZE) * GRID_SIZE;

    updateComponent(id, {
      size: { width: newWidth, height: newHeight },
      position: { x, y }, // Actualizamos la posición si cambió (ej. al arrastrar desde tl)
    });
  }

  function handleArtboardMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (activeTool === 'select') return;

    if ((event.target as HTMLElement).closest('[role="button"]')) {
      return;
    }

    selectComponent(null);

    const artboardRect = event.currentTarget.getBoundingClientRect();
    const clickX = (event.clientX - artboardRect.left) / scale;
    const clickY = (event.clientY - artboardRect.top) / scale;

    if (activeTool === 'HeroSection') {
      const newComponentSize = { width: 600, height: 260 };

      const targetX = clickX - newComponentSize.width / 2;
      const targetY = clickY - newComponentSize.height / 2;

      const snappedX = Math.round(targetX / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(targetY / GRID_SIZE) * GRID_SIZE;

      addComponent({
        type: 'HeroSection',
        props: { title: 'Nuevo Título' },
        position: { x: snappedX, y: snappedY },
        size: newComponentSize,
      });
    }

    setActiveTool('select');
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distancia mínima para activar el drag
      },
    }),
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gray-800 overflow-hidden">
      <Toolbar />
      <div
        ref={artboardContainerRef}
        className="flex-grow flex items-center justify-center p-8"
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
            {/* 4. Cambiamos onClick por onMouseDown */}
            <Artboard
              width={ARTBOARD_WIDTH}
              height={ARTBOARD_HEIGHT}
              onMouseDown={handleArtboardMouseDown}
            >
              {components.map((comp) => (
                <Draggable key={comp.id} component={comp} />
              ))}
            </Artboard>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default DesignInterface;
