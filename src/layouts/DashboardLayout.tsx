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

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white">
      <header className="border-b border-gray-700 py-5 px-24">
        <nav>
          <div className="flex items-center gap-6 justify-between">
            <UserIcon imgUrl="https://avatars.githubusercontent.com/u/84928376?v=4" />
            <SearchInput></SearchInput>
            <Dialog>
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
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button type="submit" variant="secondary" className="cursor-pointer">
                    Aceptar
                  </Button>
                  <Button type="button" variant="default" className="cursor-pointer">
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
