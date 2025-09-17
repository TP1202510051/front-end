import React, { useState, useEffect } from 'react';
import { ProductFormDialog } from '@/components/created-components/ProductFormDialog';
import { createCategory, getCategoriesByProjectId } from '@/services/category.service';
import type { Category } from '@/models/categoryModel';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { exportProject } from '@/services/project.service';
import { toast } from 'react-toastify';

interface ProductInterfaceProps {
  projectId: string;
  projectName: string;
  setIsSaving?: (isSaving: boolean) => void;
}

const ProductInterface: React.FC<ProductInterfaceProps> = ({ projectId, projectName, setIsSaving }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(event.target.value);
    };

    const handleExport = async () => {
      if (!projectId || !projectName) {
        toast.error("Project ID o Project Name no encontrado.");
        return;
      }
      try {
        await exportProject(projectId, projectName);
      } catch (error) {
        toast.error(`Failed to export project: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategoriesByProjectId(Number(projectId));
            setCategories(data);
        } catch (error) {
            toast.error(`Error al obtener las categorías: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleAccept = async () => {
        try {
            const result = await createCategory(Number(projectId), categoryName);
            if(result) {
              if (setIsSaving) setIsSaving(false);
            }

            setCategories(prev => [...prev, {
              id: result.id,
              name: result.name,
              projectId: String(result.projectId),
              createdAt: result.createdAt,
            }]);

            setCategoryName("");
            setIsOpen(false);
        } catch (error) {
            toast.error(`Error al crear categoría: ${error instanceof Error ? error.message : String(error)}`);
        }
        };

    useEffect(() => {
        setCategories([]);
        fetchCategories();
    }, [projectId]);

    const handleRemoveCategory = (categoryId: string) => {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    };


  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col overflow-y-auto pr-2">
          <div className='py-2 gap-2 flex items-center content-center justify-between border-b-2 border-t-2 border-border'>
            <span className="text-lg font-semibold">Categorias</span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="transition-colors cursor-pointer">
                  <Plus className="" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-sm outline-none bg-[var(--dialog-background)] text-[var(--dialog-foreground)] w-[90vw] max-w-md">
                <DialogTitle className=".lato-regular">
                  Ingrese nombre de la nueva categoria
                </DialogTitle>
                <div className="mt-4">
                  <Input
                    id="link"
                    placeholder="Nombre..."
                    className="w-full p-2 rounded border focus:outline-none selection:bg-gray-700/50"
                    onChange={handleInputChange}
                    value={categoryName}
                  />
                </div>
                <DialogFooter className="pt-2 sm:justify-around">
                  <Button type="submit" variant="inverseDark" className="cursor-pointer"  onClick={() => { handleAccept(); if (setIsSaving) setIsSaving(true); }}>
                    Aceptar
                  </Button>
                  <Button type="button" variant="inverseLight" className="cursor-pointer"  onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
              {categories.map((category) => (
                <div key={category.id} className="pl-2 pt-2 rounded flex flex-col gap-2">
                  <div className='pl-4'>
                    <ProductFormDialog categoryId={category.id ?? ''} categoryName={category.name} setIsSaving={setIsSaving} onDeleteCategory={handleRemoveCategory}/>
                  </div>
                </div>
          ))}
      </div>
      <div className="mt-auto pt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="mr-2 h-4 w-4"/>
              Exportar Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar Exportación</DialogTitle>
              <DialogDescription className="text-gray-400 pt-2">
                Esto descargará un archivo .zip con el proyecto. ¿Deseas continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleExport}>
                Descargar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>    
    </div>
  );
};

export default ProductInterface;