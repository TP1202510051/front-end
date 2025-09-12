import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useAutoScroll(ref: RefObject<HTMLDivElement | null>, deps: unknown[]) {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, deps);
}
