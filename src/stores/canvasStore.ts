import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  x: number;
  y: number;
}

interface HeroProps {
  title: string;
}

interface ProductGridProps {
  category: string;
}

export type CanvasComponent =
  | {
      id: string;
      type: 'HeroSection';
      props: HeroProps;
      position: Position;
      size: { width: number; height: number };
    }
  | {
      id: string;
      type: 'ProductGrid';
      props: ProductGridProps;
      position: Position;
      size: { width: number; height: number };
    };

export type ActiveTool = 'select' | 'HeroSection';

interface CanvasState {
  components: CanvasComponent[];
  activeTool: ActiveTool;
  selectedComponentId: string | null;
  updateComponent: (
    id: string,
    newValues: Partial<Omit<CanvasComponent, 'id' | 'type'>>,
  ) => void;
  addComponent: (component: Omit<CanvasComponent, 'id'>) => void;
  setActiveTool: (tool: ActiveTool) => void;
  selectComponent: (id: string | null) => void;
}

const initialComponents: CanvasComponent[] = [
  {
    id: 'hero-1',
    type: 'HeroSection',
    props: { title: 'Descubre la Nueva Colección' },
    position: { x: 40, y: 20 },
    size: { width: 600, height: 260 },
  },
  {
    id: 'prod-grid-1',
    type: 'ProductGrid',
    props: { category: 'Novedades' },
    position: { x: 40, y: 320 },
    size: { width: 600, height: 400 },
  },
];

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      components: initialComponents,

      activeTool: 'select',

      selectedComponentId: null,

      setActiveTool: (tool) => set({ activeTool: tool }),

      selectComponent: (id) => set({ selectedComponentId: id, activeTool: 'select' }),

      addComponent: (componentData) =>
        set((state) => ({
          components: [
            ...state.components,
            {
              id: `comp-${Date.now()}`, // Generamos un ID único
              ...componentData,
            } as CanvasComponent,
          ],
        })),

      updateComponent: (id, newValues) =>
        set((state) => ({
          components: state.components.map((comp) =>
            comp.id === id ? ({ ...comp, ...newValues } as CanvasComponent) : comp,
          ),
        })),
    }),
    {
      name: 'canvas-storage',
    },
  ),
);
