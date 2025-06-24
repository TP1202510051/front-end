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
import UserIcon from '@/components/ui/user-icon';
import { Plus } from 'lucide-react';
import { Outlet } from 'react-router';
import { useState } from 'react';
import { createProject } from '../services/project.service';

export const DashboardLayout = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  //const [loading, setLoading] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);  // Aquí se actualiza correctamente el estado con el valor del input
  };


  const handleAccept = async () => {


    try {
      const result = await createProject(1, projectName); // Pasa el ID y el nombre del proyecto
      // Asegúrate de que 'result' es lo que esperas (un objeto con respuesta, por ejemplo)
      console.log("Proyecto creado con éxito:", response);  // Verifica lo que devuelve el backend
      setResponse(`Proyecto creado con éxito: ${result.answer}`); // Usa la respuesta correcta del backend
    } catch (error) {
      setResponse("Hubo un error al crear el proyecto.");
      console.error("Error al crear proyecto:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white">
      <header className="border-b border-gray-700 py-5 px-24">
        <nav>
          <div className="flex items-center gap-6 justify-between">
            <UserIcon imgUrl="https://avatars.githubusercontent.com/u/84928376?v=4" />
            <SearchInput></SearchInput>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="hover:bg-gray-700 transition-colors cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none">
                <DialogTitle className="text-white .lato-regular">
                  Ingrese nombre del nuevo proyecto
                </DialogTitle>
                <div className="mt-4">
                  <Input
                    id="link"
                    placeholder="Nombre..."
                    className="w-full p-2 text-white rounded border focus:outline-none selection:bg-gray-700/50"
                    onChange={handleInputChange}
                    value={projectName}
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button type="submit" variant="secondary" className="cursor-pointer"  onClick={handleAccept}>
                    Aceptar
                  </Button>
                  <Button type="button" variant="default" className="cursor-pointer"  onClick={() => setIsOpen(false)}>
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
