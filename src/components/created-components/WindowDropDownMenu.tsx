import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MessageCircle } from "lucide-react";
import type { AppWindow } from "@/models/windowModel";

interface WindowDropDownMenuProps {
  win: AppWindow;
  onSelect: (w: AppWindow) => void;
  onEdit: (w: AppWindow) => void;
  onDelete: (w: AppWindow) => void;
  onOpenChat: (w: AppWindow) => void;
}

export const WindowDropDownMenu: React.FC<WindowDropDownMenuProps> = ({
  win,
  onSelect,
  onEdit,
  onDelete,
  onOpenChat,
}) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <div
        className="flex flex-row items-center gap-2"
        onClick={() => onSelect(win)}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
      >
        <Button variant="design" className="flex-1 justify-start">
          {win.name}
        </Button>
        <Button onClick={() => onOpenChat(win)} variant="ghost">
          <MessageCircle className="h-4 w-4" />
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
