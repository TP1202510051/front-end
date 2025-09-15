import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProjectCreation } from '@/hooks/useProjectCreation';

export const CreateProjectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { createNewProject, loading } = useProjectCreation();

  const handleAccept = () => {
    createNewProject(projectName.trim());
    setProjectName('');
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAccept();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hover:bg-gray-700 transition-colors cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#2C2C2C] rounded-sm border-gray-700 text-white">
        <DialogTitle>Ingrese nombre del nuevo proyecto</DialogTitle>
        <div className="mt-4">
          <Input
            placeholder="Nombre..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyPress}
          />
        </div>
        <DialogFooter>
          <Button variant="primary" onClick={handleAccept} disabled={!projectName.trim() || loading}>
            Aceptar
          </Button>
          <Button variant="default" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
