import React from "react";
import { useEditing } from "@/contexts/EditingContext";

interface ComponentWrapperProps {
  id?: string;
  name?: string;
  windowId: string | 0;
  children?: React.ReactNode;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ id, name = "", windowId, children }) => {
  const { openComponent } = useEditing();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openComponent(id ?? "", { name, windowId: windowId.toString() });
      }}
      className="relative group border border-transparent hover:border-blue-500 hover:shadow-md cursor-pointer"
    >
      {children}
    </div>
  );
};

export default ComponentWrapper;
