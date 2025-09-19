import React, { useState } from "react";
import { useEditing } from "@/contexts/EditingContext";

interface ComponentWrapperProps {
  id?: string;
  name?: string;
  windowId: string | 0;
  children?: React.ReactNode;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ id, name = "", windowId, children }) => {
  const { openComponent } = useEditing();
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsActive(true)
        openComponent(id ?? "", { name, windowId: windowId.toString() });
      }}
      className={`relative group border hover:shadow-md cursor-pointer ${isActive ? "border-blue-500" : "border-transparent"}`}
    >
      {children}
    </div>
  );
};

export default ComponentWrapper;
