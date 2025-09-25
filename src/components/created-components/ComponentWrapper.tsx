import React from "react";
import { useEditing } from "@/contexts/EditingContext";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";

interface ComponentWrapperProps {
  id?: string;
  name?: string;
  windowId: string;
  children?: React.ReactNode;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ id, name = "", windowId, children }) => {
  const { openComponent, selectedId } = useEditing();

  return (
    <div className="flex w-full gap-2">
      <Button
        className={`rounded-full bg-black text-white ${selectedId === id ? "visible" : "invisible"}`}
        onClick={(e) => {
          e.stopPropagation();
          console.log("[ComponentWrapper] openComponent clicked", { id, name, windowId });
          if (!id || isNaN(Number(id))) {
            console.error("❌ Intento de abrir componente sin ID válido", { id, name, windowId });
            return;
          }
          openComponent(id, { name, windowId });
        }}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <div
        onClick={(e) => {
          const tag = (e.target as HTMLElement).tagName.toLowerCase();
          if (!["button", "svg", "path", "input", "label"].includes(tag)) {
            e.stopPropagation();
            console.log("[ComponentWrapper] Div clicked", { id, name, windowId });
            openComponent(id ?? "0", { name, windowId });
          }
        }}
        className={`flex-1 relative group border hover:border-2 hover:shadow-md hover:border-blue-500 cursor-pointer 
          ${selectedId === id ? "border-blue-500 border-2 animate-pulse" : "border-transparent"}`}
      >
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};

export default ComponentWrapper;
