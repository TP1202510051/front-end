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

interface ProductInterfaceProps {
  projectId: string;
  projectName: string;
}

const ProductInterface: React.FC<ProductInterfaceProps> = ({ projectId, projectName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(event.target.value);
    };

    const handleExport = async () => {
      if (!projectId || !projectName) {
        console.error("Project ID o Project Name no encontrado.");
        return;
      }
      try {
        await exportProject(projectId, projectName);
      } catch (error) {
        console.error('Failed to export project:', error);
      }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategoriesByProjectId(Number(projectId));
            setCategories(data);
        } catch (error) {
            console.error('Error al obtener las categorías', error);
        }
    };

    const handleAccept = async () => {
        try {
            const result = await createCategory(Number(projectId), categoryName);
            console.log("Categoría creada con éxito:", result);
            
            setCategories(prev => [...prev, {
            id: result.id,
            categoryName: result.categoryName,
            projectId: String(result.projectId),
            createdAt: result.createdAt,
            }]);

            setCategoryName("");
            setIsOpen(false);
        } catch (error) {
            console.error("Error al crear categoría:", error);
        }
        };

    useEffect(() => {
        setCategories([]);
        fetchCategories();
    }, [projectId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="hover:bg-gray-700 transition-colors cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[var(--dashboard-background)] rounded-sm outline-none">
                  <DialogTitle className="text-white .lato-regular">
                    Ingrese nombre de la nueva categoria
                  </DialogTitle>
                  <div className="mt-4">
                    <Input
                      id="link"
                      placeholder="Nombre..."
                      className="w-full p-2 text-white rounded border focus:outline-none selection:bg-gray-700/50"
                      onChange={handleInputChange}
                      value={categoryName}
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
              <span className="text-xl font-medium">Categorias: </span>
              {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded shadow flex flex-col gap-2">
                      <span className="text-lg font-medium">{category.categoryName}</span>
                      <ProductFormDialog categoryId={category.id ?? ''}/>
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
