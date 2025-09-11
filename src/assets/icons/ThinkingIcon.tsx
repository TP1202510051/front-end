export function ThinkingIndicator() {
  return (
    <div className="flex px-3 mt-4 space-x-1 items-center text-white">
      <span className="text-xs">Pensando</span>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} className={`animate-bounce [animation-delay:${delay}s]`}>
          <svg width="5" height="5" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="white" />
          </svg>
        </div>
      ))}
    </div>
  );
}
