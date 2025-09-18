import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getComponentsByWindowId, type Component } from "@/services/component.service";
import { useEditing } from "@/contexts/EditingContext";
import { toast } from "react-toastify";

interface ComponentSidebarProps {
  windowId: string;
}

export const ComponentSidebar: React.FC<ComponentSidebarProps> = ({ windowId }) => {
  const { openComponent } = useEditing();
  const [components, setComponents] = useState<Component[]>([]);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const data = await getComponentsByWindowId(Number(windowId));
        setComponents(data);
      } catch (error) {
        toast.error(
          `Error al obtener componentes: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    if (windowId) {
      setComponents([]);
      fetchComponents();
    }
  }, [windowId]);

  if (!windowId) return null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b-2 border-border border-t-2 py-2 mb-2">
        <span className="text-lg font-semibold">Componentes</span>
      </div>

      <div className="flex flex-col gap-2">
        {components.map((comp) => (
          <Button
            key={comp.id}
            variant="design"
            className="justify-start"
            onClick={() =>
              openComponent(comp.id, { name: comp.name, windowId })
            }
          >
            {comp.name}
          </Button>
        ))}
      </div>
    </div>
  );
};