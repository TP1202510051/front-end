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
    }
  | {
      id: string;
      type: 'CustomCode';
      props: { code: string };
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
  setComponents: (
    comps: CanvasComponent[] | { components: CanvasComponent[] }
  ) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      components: [],
      activeTool: 'select',
      selectedComponentId: null,

      setActiveTool: (tool) => set({ activeTool: tool }),

      selectComponent: (id) => set({ selectedComponentId: id, activeTool: 'select' }),

      addComponent: (componentData) =>
        set((state) => ({
          components: [
            ...state.components,
            {
              id: `comp-${Date.now()}`,
              ...componentData,
            } as CanvasComponent,
          ],
        })),

      updateComponent: (id, newValues) =>
        set((state) => ({
          components: state.components.map((comp) =>
            comp.id === id ? ({ ...comp, ...newValues } as CanvasComponent) : comp
          ),
        })),

      setComponents: (comps: CanvasComponent[] | { components: CanvasComponent[] }) => {
        const normalized: CanvasComponent[] = Array.isArray(comps)
          ? comps
          : Array.isArray((comps as { components?: CanvasComponent[] }).components)
          ? (comps as { components: CanvasComponent[] }).components
          : [];
        set({
          components: normalized,
          selectedComponentId: null,
          activeTool: 'select',
        });
      },
    }),
    {
      name: 'canvas-storage',
    }
  )
);
