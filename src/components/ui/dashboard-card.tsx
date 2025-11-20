import { Card, CardContent, CardFooter } from './card';
import { Clock } from 'lucide-react';
import { useState } from "react"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { deleteProject } from '@/services/project.service';
import { toast } from 'react-toastify';
import type { Project } from "@/models/projectModel";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardCardProps {
  id: string;
  imageUrl: string;
  title: string;
  lastEdited?: string;
  loadingProjects: React.Dispatch<React.SetStateAction<boolean>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};

const DashboardCard = ({ id, imageUrl, title, lastEdited, loadingProjects, setProjects }: DashboardCardProps) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  const handleDelete = async () => {
    loadingProjects(true);
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success("Proyecto eliminado correctamente");
    } catch (error) {
      toast.error(`Error al eliminar el proyecto: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      loadingProjects(false);
    }
  };

  const handleConfirmDelete = async () => {
    await handleDelete();
    setConfirmOpen(false);
    setConfirmText("");
  };

  const isMatch = confirmText.trim() === title;

  return (
    <>
      <Card
        onClick={() => navigate(`/design-interface/${id}/${title}`)}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        className="w-full py-0 gap-0 overflow-hidden rounded-lg bg-[var(--card-background)] backdrop-blur-sm border border-[var(--card-background)]*80
        hover:border-sky-400 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <CardContent className="p-0">
          <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
        </CardContent>

        <CardFooter className="flex flex-col flex-grow items-start p-4 pt-2 .lato-regular">
          <div className="text-md text-[var(--card-foreground)]">{title}</div>
          <div className="flex items-center gap-2 text-xs mt-auto text-[var(--card-foreground)]/40">
            <Clock className="h-3 w-3" />
            <span>{lastEdited}</span>
          </div>
        </CardFooter>

        {menuPos && (
          <DropdownMenu open onOpenChange={(open) => !open && setMenuPos(null)}>
            <DropdownMenuContent
              onClick={(e) => e.stopPropagation()}
              className="w-40"
              style={{ position: "fixed", left: menuPos.x, top: menuPos.y }}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuPos(null);
                  setConfirmOpen(true); // abrimos el diálogo
                }}
                className="text-red-600 focus:text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setConfirmText("");
        }}
      >
        <DialogContent
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Eliminar proyecto</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Escribe el nombre del proyecto para confirmar:
              <span className="font-semibold block mt-1">{title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={title}
            />
            {!isMatch && confirmText.length > 0 && (
              <p className="text-xs text-red-500">
                El texto no coincide con el nombre del proyecto.
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!isMatch}
              onClick={handleConfirmDelete}
            >
              Confirmar eliminación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardCard;