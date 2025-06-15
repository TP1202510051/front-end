import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialComponents = [
  {
    id: 'hero-1',
    type: 'HeroSection',
    props: { title: 'Descubre la Nueva Colección' },
    position: { x: 40, y: 20 },
  },
  {
    id: 'prod-grid-1',
    type: 'ProductGrid',
    props: { category: 'Novedades' },
    position: { x: 40, y: 320 },
  },
];

export const useCanvasStore = create(
    persist(
        {
            name: 'canvas-storage', // nombre para el localStorage
        },
        (set) => ({
        components: initialComponents,

        // ACCIÓN: Mover un componente a una nueva posición
        moveComponent: (componentId, newPosition) =>
            set((state) => ({
            components: state.components.map((comp) =>
                comp.id === componentId ? { ...comp, position: newPosition } : comp
            ),
            })),
        })
    )
)