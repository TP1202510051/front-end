import React, { createContext, useContext, useMemo, useState } from "react";
import type { AppWindow } from "@/models/windowModel";

export type EditingTarget =
  | { kind: "project"; id: string; name?: string }
  | { kind: "window"; id: string; name?: string; window: AppWindow }
  | { kind: "component"; id: string; name?: string; windowId: string }; // 👈 obligatorio

type Ctx = {
  target: EditingTarget | null;
  showChat: boolean;
  openProject: (id: string, name?: string) => void;
  openWindow: (win: AppWindow) => void;
  openComponent: (id: string, opts?: { name?: string; windowId?: string }) => void;
  closeChat: () => void;
  clearTarget: () => void;
};

const EditingContext = createContext<Ctx | null>(null);

export const EditingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [target, setTarget] = useState<EditingTarget | null>(null);
  const [showChat, setShowChat] = useState(false);

  const value = useMemo<Ctx>(() => ({
    target,
    showChat,
    openProject: (id, name) => {
      setTarget({ kind: "project", id, name });
      setShowChat(true);
    },
    openWindow: (win) => {
      setTarget({ kind: "window", id: String(win.id), name: win.name, window: win });
      setShowChat(true);
    },
    openComponent: (id, opts) => {
      if (!opts?.windowId) {
        console.error("❌ Component opened without windowId");
        return;
      }
      setTarget({
        kind: "component",
        id, // este debe ser el id real del componente
        name: opts?.name,
        windowId: opts.windowId, // 👈 windowId is guaranteed to exist here
      });
      setShowChat(true);
    },
    closeChat: () => setShowChat(false),
    clearTarget: () => setTarget(null),
  }), [target, showChat]);

  return <EditingContext.Provider value={value}>{children}</EditingContext.Provider>;
};

export const useEditing = () => {
  const ctx = useContext(EditingContext);
  if (!ctx) throw new Error("useEditing must be used within EditingProvider");
  return ctx;
};
