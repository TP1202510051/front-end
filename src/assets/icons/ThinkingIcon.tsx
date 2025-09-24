import { useEffect, useState } from "react";

export function ThinkingIndicator() {
  const [toggleText, setToggleText] = useState(true);

  useEffect(()=> {
    const interval = setInterval(() => {
      setToggleText((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [])

  return (
    <div className="flex px-3 mt-4 space-x-1 items-baseline text-[var(--dialog-foreground)]">
      <span className="text-xs">{toggleText ? "Pensando" : "Creando"}</span>
      {[0, 0.1, 0.2].map((i) => (
        <div
          key={i}
          className="animate-bounce"
          style={{ animationDelay: `${i}s` }}
        >
          <svg width="5" height="5" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="var(--dialog-foreground)" />
          </svg>
        </div>
      ))}
    </div>
  );
}
