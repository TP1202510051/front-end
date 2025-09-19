import React from "react";
import { useEditing } from "@/contexts/EditingContext";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";

interface ComponentWrapperProps {
  id?: string;
  name?: string;
  windowId: string | 0;
  children?: React.ReactNode;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ id, name = "", windowId, children }) => {
  const { selectComponent, openComponent, selectedId } = useEditing();

  return (
    <div className="flex w-full gap-2">
      <Button variant={"inverseDark"} className={`rounded-full h-10 ${selectedId === id ? "visible" : "invisible"}`} onClick={(e) => {
        e.stopPropagation();
        openComponent(id ?? "", { name, windowId: windowId.toString() });
      }}>
        <MessageCircle className="h-4 w-4" />
      </Button>
        <div
        onClick={(e) => {
          e.stopPropagation();
          selectComponent(id ?? ""); 
        }}
        className={`flex-1 relative group border hover:shadow-md hover:border-[var(--dashboard-foreground)] cursor-pointer 
          ${selectedId === id ? "border-[var(--dashboard-foreground)] animate-pulse" : "border-transparent"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ComponentWrapper;
