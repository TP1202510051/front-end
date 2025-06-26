import React, { useState, useEffect, useRef } from 'react';
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
import ChatInterface from '../chat-interface/ChatInterface';

const GRID_SIZE = 20;
const ARTBOARD_WIDTH = 3000;
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
      const { width, height } = container.getBoundingClientRect();
      const scaleX = width / ARTBOARD_WIDTH;
      const scaleY = height / ARTBOARD_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const id = active.id as string;
    const d = { x: delta.x / scale, y: delta.y / scale };
    if (id.includes('-handle-')) {
      const [compId, handleId] = id.split('-handle-');
      resizeComponent(compId, handleId, d);
    } else {
      moveComponent(id, d);
    }
  }

  function moveComponent(id: string, delta: { x: number; y: number }) {
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    let x = comp.position.x + delta.x;
    let y = comp.position.y + delta.y;
    x = Math.max(0, Math.min(x, ARTBOARD_WIDTH - comp.size.width));
    y = Math.max(0, Math.min(y, ARTBOARD_HEIGHT - comp.size.height));
    updateComponent(id, { position: { x: Math.round(x / GRID_SIZE) * GRID_SIZE, y: Math.round(y / GRID_SIZE) * GRID_SIZE } });
  }

  function resizeComponent(id: string, handle: string, delta: { x: number; y: number }) {
    const comp = components.find((c) => c.id === id);
    if (!comp) return;
    let { width, height, x, y } = { width: comp.size.width, height: comp.size.height, x: comp.position.x, y: comp.position.y };
    switch (handle) {
      case 'br': width += delta.x; height += delta.y; break;
      case 'bl': width -= delta.x; height += delta.y; x += delta.x; break;
      case 'tr': width += delta.x; height -= delta.y; y += delta.y; break;
      case 'tl': width -= delta.x; height -= delta.y; x += delta.x; y += delta.y; break;
      case 't': height -= delta.y; y += delta.y; break;
      case 'b': height += delta.y; break;
      case 'l': width -= delta.x; x += delta.x; break;
      case 'r': width += delta.x; break;
    }
    const min = GRID_SIZE * 2;
    width = Math.max(width, min);
    height = Math.max(height, min);
    updateComponent(id, { size: { width: Math.round(width / GRID_SIZE) * GRID_SIZE, height: Math.round(height / GRID_SIZE) * GRID_SIZE }, position: { x, y } });
  }

  function handleArtboardMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (activeTool !== 'select' && !(e.target as HTMLElement).closest('[role="button"]')) {
      selectComponent(null);
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / scale;
      const clickY = (e.clientY - rect.top) / scale;
      if (activeTool === 'HeroSection') {
        const size = { width: 600, height: 260 };
        const x = Math.round((clickX - size.width / 2) / GRID_SIZE) * GRID_SIZE;
        const y = Math.round((clickY - size.height / 2) / GRID_SIZE) * GRID_SIZE;
        addComponent({ type: 'HeroSection', props: { title: 'Nuevo Título' }, position: { x, y }, size });
      }
      setActiveTool('select');
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <div className="w-full h-screen flex flex-col bg-[#202123] overflow-hidden">
      <Toolbar />
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/4 bg-gray-700 flex flex-col overflow-auto">
          <h2 className="text-white font-semibold p-2">Componentes</h2>
          <ul className="flex-1 overflow-auto p-2 space-y-1">
            {components.map((c) => <li key={c.id} className="text-gray-200">{c.type}</li>)}
          </ul>
        </div>
        <div ref={artboardContainerRef} className="flex-grow flex items-center justify-center overflow-hidden">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
              <Artboard width={ARTBOARD_WIDTH} height={ARTBOARD_HEIGHT} onMouseDown={handleArtboardMouseDown}>
                {components.map((c) => <Draggable key={c.id} component={c} />)}
              </Artboard>
            </div>
          </DndContext>
        </div>
        <div className="w-1/2 bg-gray-900 flex flex-col overflow-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default DesignInterface;
