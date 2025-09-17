import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditIcon } from 'lucide-react';
import { updateProjectName, deleteProject } from '@/services/project.service';
import { toast } from 'react-toastify';

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
}

export const ProjectHeader = ({ projectId, projectName, setIsSaving }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState(projectName);

  const handleUpdateName = async () => {
    if (!projectId) return;
    try {
      setIsSaving(true);
      await updateProjectName(projectId, newProjectName);
      toast.success('Nombre actualizado');
      navigate(`/design-interface/${projectId}/${newProjectName}`);
    } catch {
      toast.error('Error al actualizar nombre');
    } finally {
      setIsDialogOpen(false);
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    try {
      await deleteProject(projectId);
      toast.success('Proyecto eliminado');
      navigate('/dashboard');
    } catch {
      toast.error('Error al eliminar proyecto');
    }
  };

  return (
    <div className="flex flex-row items-center justify-between mb-4">
      <h2 className=" font-bold text-xl">{projectName}</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Editar proyecto">
            <EditIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded bg-[var(--dialog-background)] text-[var(--dialog-foreground)]">
          <DialogTitle>Editar nombre del proyecto</DialogTitle>
          <div className="mt-4">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="border border-gray-600"
            />
          </div>
          <DialogFooter className="pt-4 flex justify-between">
            <Button onClick={handleUpdateName} variant={"inverseDark"}>
              Aceptar
            </Button>
            <Button onClick={handleDeleteProject} variant="destructive">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
