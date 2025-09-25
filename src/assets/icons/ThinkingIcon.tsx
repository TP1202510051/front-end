import { useEffect, useState } from "react";

export function ThinkingIndicator() {
  const [text, setText] = useState("Pensando");

  useEffect(() => {
    const timer = setTimeout(() => {
      setText("Creando");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex px-3 mt-4 space-x-1 items-baseline text-[var(--dialog-foreground)] animate-pulse">
      <span className="text-xs">{text}</span>
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
