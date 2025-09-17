import { useEffect, useState } from 'react';

interface SavingStatusProps {
  isSaving: boolean;
}

export const SavingStatus = ({ isSaving }: SavingStatusProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSaving) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  return isSaving ? (
    <div className="left-0 w-full flex gap-1 items-center animate-pulse text-[var(--dashboard-foreground)]">
      <h1 className="text-xs">Saving...</h1>
    </div>
  ) : (
    <div
      className={`left-0 w-full flex gap-1 items-center transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h1 className="text-xs">Saved</h1>
    </div>
  );
};
