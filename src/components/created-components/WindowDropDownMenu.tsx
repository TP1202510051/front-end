import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { AppWindow } from "@/models/windowModel";
import { useEditing } from "@/contexts/EditingContext"; // <-- importa el hook

interface WindowDropDownMenuProps {
  win: AppWindow;
  onSelect: (w: AppWindow) => void;
  onEdit: (w: AppWindow) => void;
  onDelete: (w: AppWindow) => void;
}

export const WindowDropDownMenu: React.FC<WindowDropDownMenuProps> = ({
  win,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { closeChat } = useEditing();

  return (
    <>
      <div
        className="flex flex-row items-center gap-2"
        onClick={() => {
          closeChat();
          onSelect(win);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
      >
        <Button variant="design" className="flex-1 justify-start border-1 border-[var(--sidebar-foreground)]">
          {win.name}
        </Button>
      </div>

      {menuPos && (
        <DropdownMenu open onOpenChange={(open) => !open && setMenuPos(null)}>
          <DropdownMenuContent
            className="w-40"
            style={{ position: "fixed", left: menuPos.x, top: menuPos.y }}
          >
            <DropdownMenuItem onClick={() => onEdit(win)}>Modificar</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onDelete(win);
                setMenuPos(null);
              }}
              className="text-red-600 focus:text-red-600"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
