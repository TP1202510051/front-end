import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SearchInput from '@/components/ui/search-input';
import { UserNav } from '@/components/auth/UserNav';
import { Plus } from 'lucide-react';
import { Outlet } from 'react-router';
import { useState } from 'react';
import { createProject } from '../services/project.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Obtenemos el usuario del contexto
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleAccept = async () => {
    if (!currentUser) {
      console.error('Error: No hay un usuario autenticado para crear el proyecto.');
      // Opcional: Mostrar una alerta al usuario
      alert('Debes iniciar sesión para crear un proyecto.');
      return;
    }

    try {
      const result = await createProject(currentUser.uid, projectName);
      console.log('Proyecto creado con éxito:', result);
      setIsOpen(false);
      setProjectName(''); // Limpiamos el input
      // Usamos el ID del proyecto devuelto por el servicio para la navegación
      navigate(`/design-interface/${result}/${projectName}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white">
      <header className="border-b border-gray-700 py-5 px-6 md:px-24">
        <nav>
          <div className="flex items-center gap-6 justify-between">
            {/* 1. Reemplazamos el UserIcon estático por el UserNav dinámico */}
            <UserNav />
            <div className="flex-grow max-w-md">
              <SearchInput />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="hover:bg-gray-700 transition-colors cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none border-gray-700">
                <DialogTitle className="text-white .lato-regular">
                  Ingrese nombre del nuevo proyecto
                </DialogTitle>
                <div className="mt-4">
                  <Input
                    id="link"
                    placeholder="Nombre..."
                    className="w-full p-2 text-white bg-[#333] rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 selection:bg-gray-700/50"
                    onChange={handleInputChange}
                    value={projectName}
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={handleAccept}
                  >
                    Aceptar
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
