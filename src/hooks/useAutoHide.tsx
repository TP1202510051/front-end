import { useEffect, useState } from "react";

export function useAutoHide(trigger: boolean, delay = 3000) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!trigger) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay]);
  return visible;
}
