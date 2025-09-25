import React, { createContext, useContext, useState } from "react";
import type { AppWindow } from "@/models/windowModel";
import { toast } from "react-toastify";

export type EditingTarget =
  | { kind: "project"; id: string; name?: string }
  | { kind: "window"; id: string; name?: string; window: AppWindow }
  | { kind: "component"; id: string; name?: string; windowId: string };

export type EditingContextType = {
  target: EditingTarget | null;
  showChat: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectComponent: (id: string) => void;
  openProject: (id: string, name?: string) => void;
  openWindow: (win: AppWindow) => void;
  openComponent: (id: string, opts: { name?: string; windowId: string }) => void;
  closeChat: () => void;
  clearTarget: () => void;
};

const EditingContext = createContext<null | EditingContextType>(null);

export const EditingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [target, setTarget] = useState<EditingTarget | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const value: EditingContextType = {
    target,
    showChat,
    selectedId,
    setSelectedId,

    selectComponent: (id) => {
      if (selectedId === id) {
        setSelectedId(null);
        setShowChat(false);
        setTarget(null);
      } else {
        setSelectedId(id);
        setShowChat(false);
        setTarget(null);
      }
    },

    openProject: (id, name) => {
      setTarget({ kind: "project", id, name });
      setShowChat(true);
    },

    openWindow: (win) => {
      if (target?.kind === "window" && target.id === String(win.id) && showChat) {
        setShowChat(false);
        setTarget(null);
        return;
      }
      setTarget({ kind: "window", id: String(win.id), name: win.name, window: win });
      setShowChat(true);
    },

    openComponent: (id, opts) => {
      console.log("[EditingContext] openComponent called", { id, opts });

      if (!opts?.windowId) {
        toast.error("❌ Component opened without windowId");
        return;
      }

      if (target?.kind === "component" && target.id === id && showChat) {
        setShowChat(false);
        setTarget(null);
        return;
      }

      setTarget({ kind: "component", id, name: opts?.name, windowId: opts.windowId });
      setShowChat(true);
      setSelectedId(id);

      console.log("[EditingContext] new target set", {
        id,
        name: opts?.name,
        windowId: opts.windowId,
      });
    },

    closeChat: () => setShowChat(false),

    clearTarget: () => {
      setTarget(null);
      setSelectedId(null);
    },
  };

  return <EditingContext.Provider value={value}>{children}</EditingContext.Provider>;
};

export const useEditing = () => {
  const ctx = useContext(EditingContext);
  if (!ctx) throw new Error("useEditing must be used within EditingProvider");
  return ctx;
};
