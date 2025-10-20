import { useState } from "react";
import { windowNames } from "@/utils/constants/windowNames";
import { Button } from "@/components/ui/button";


interface CreationWindowCardProps {
  onSelectName: (name: string) => void;
}

export default function CreationWindowCard({ onSelectName }: CreationWindowCardProps) {
  const [names] = useState<string[]>(Object.values(windowNames));

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {names.map((name) => (
        <Button
          key={name}
          variant="outline"
          className="text-sm"
          onClick={() => onSelectName(name)}
        >
          {name}
        </Button>
      ))}
    </div>
  );
}
