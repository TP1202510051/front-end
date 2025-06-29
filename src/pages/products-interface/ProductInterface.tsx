import React, { useState, useEffect } from 'react';
import { ProductFormDialog } from '@/components/created-components/ProductFormDialog';
import { createCategory, getCategoriesByProjectId } from '@/services/category.service';
import type { Category } from '@/models/categoryModel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


interface ProductInterfaceProps {
  projectId: string;
}

const ProductInterface: React.FC<ProductInterfaceProps> = ({ projectId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(event.target.value);
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
          console.log("Cateogria creada con éxito:", result);
          setIsOpen(false);
        } catch (error) {
          console.error("Error al crear categoria:", error);
        }
      };

    useEffect(() => {
        setCategories([]);
        fetchCategories();
    }, [projectId]);

  return (
    <div className="flex flex-col gap-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="hover:bg-gray-700 transition-colors cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Categoria
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
            <span className="text-xl font-medium">Categories: </span>
            {categories.map((category) => (
                <div key={category.id} className="p-4 border rounded shadow flex flex-col gap-2">
                    <span className="text-lg font-medium">{category.categoryName}</span>
                    <ProductFormDialog categoryId={category.id ?? ''}/>
            </div>
        ))}
    </div>
  );
};

export default ProductInterface;
