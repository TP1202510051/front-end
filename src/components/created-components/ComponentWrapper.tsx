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
      <Button
        className={`rounded-full bg-black text-white ${selectedId === id ? "visible" : "invisible"}`}
        onClick={(e) => {
          e.stopPropagation();
          openComponent(id ?? "", { name, windowId: windowId.toString() });
        }}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <div
        onClick={(e) => {
          const tag = (e.target as HTMLElement).tagName.toLowerCase();
          if (tag !== "button" && tag !== "svg" && tag !== "path" && tag !== "input" && tag !== "label") {
            e.stopPropagation();
            selectComponent(id ?? "");
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
