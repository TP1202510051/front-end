import { useMemo } from "react";
import { windowNames } from "@/utils/constants/windowNames";
import { Button } from "@/components/ui/button";

interface CreationWindowCardProps {
  onSelectName: (name: string) => void;
  existingWindows: string[];
}

export default function CreationWindowCard({ onSelectName, existingWindows }: CreationWindowCardProps) {
  const allNames = Object.values(windowNames);

  // Filtrar nombres ya usados en el proyecto
  const availableNames = useMemo(
    () =>
      allNames.filter(
        (n) => !existingWindows.some((w) => w.trim().toLowerCase() === n.trim().toLowerCase())
      ),
    [allNames, existingWindows]
  );

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {availableNames.length > 0 ? (
        availableNames.map((name) => (
          <Button
            key={name}
            variant="outline"
            className="text-sm"
            onClick={() => onSelectName(name)}
          >
            {name}
          </Button>
        ))
      ) : (
        <p className="text-sm text-gray-500 col-span-2">
          Ya has creado todas las ventanas disponibles.
        </p>
      )}
    </div>
  );
}
