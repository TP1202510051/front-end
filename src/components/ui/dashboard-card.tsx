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
  const navigate = useNavigate();
  const handleDelete = async () => {
    loadingProjects(true);
      try {
        await deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        toast.error(`Error al eliminar el proyecto: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        loadingProjects(false);
      }
  }
  
  return (
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
                  handleDelete();
                  setMenuPos(null);
                }}
                className="text-red-600 focus:text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
    </Card>
  );
};

export default DashboardCard;
