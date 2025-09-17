import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCategoryName, deleteCategory } from "@/services/category.service";
import { toast } from "react-toastify";

interface Props {
  categoryId: string;
  categoryName?: string;
  setIsSaving?: (b: boolean) => void;
  onDeleteCategory?: (id: string) => void;
}

export const CategoryDialog: React.FC<Props> = ({ categoryId, categoryName, setIsSaving, onDeleteCategory }) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editableCategoryName, setEditableCategoryName] = useState(categoryName || "");

  const handleUpdate = async () => {
    setIsSaving?.(true);
    try {
      await updateCategoryName(categoryId, editableCategoryName);
      setIsCategoryDialogOpen(false);
    } catch (err) {
      toast.error(`Error actualizando la categoría: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving?.(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving?.(true);
    try {
      await deleteCategory(categoryId);
      setIsCategoryDialogOpen(false);
      onDeleteCategory?.(categoryId);
    } catch (err) {
      toast.error(`Error eliminando la categoría: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUpdate();
  };

  return (
    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="design" className="flex-1 justify-start font-medium px-2 py-1 truncate">
          {editableCategoryName}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--dialog-background)] text-[var(--dialog-foreground)] rounded-md w-[90vw] max-w-md">
        <DialogTitle className="text-lg">Editar Categoría</DialogTitle>
        <Input className="mt-4 text-[var(--dialog-foreground)] bg-[var(--dialog-background)]" value={editableCategoryName} onChange={(e) => setEditableCategoryName(e.target.value)} onKeyDown={handleKeyPress} />
        <DialogFooter className="pt-4 flex justify-between">
          <Button onClick={handleUpdate} variant={"inverseDark"}>
            Aceptar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
