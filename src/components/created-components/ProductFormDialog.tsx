import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Product } from "@/models/productModel";
import { CategoryDialog } from "./CategoryDialog";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { useProducts } from "@/hooks/useProducts";

interface ProductDialogProps {
  categoryId: string;
  categoryName?: string;
  setIsSaving?: (isSaving: boolean) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const ProductFormDialog: React.FC<ProductDialogProps> = ({
  categoryId,
  categoryName,
  setIsSaving,
  onDeleteCategory,
}) => {
  const { products, fetchProducts, addProduct, editProduct, removeProduct } =
    useProducts(categoryId, setIsSaving);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state (se pasa a ProductForm)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sizeInputs, setSizeInputs] = useState<string[]>([""]);

  useEffect(() => {
    fetchProducts();
    resetForm();
  }, [categoryId, categoryName, fetchProducts]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDiscount("");
    setImageUrl("");
    setImageFile(null);
    setSizeInputs([""]);
    setSelectedProduct(null);
    setIsOpen(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setDiscount(String(product.discount));
    setImageUrl(product.image);
    setSizeInputs(product.sizes?.map((s) => s.name) || []);
    setIsOpen(true);
  };

  const handleSave = async (payload: Product) => {
    if (selectedProduct) {
      const updated = await editProduct(Number(selectedProduct.id), payload);
      if (updated) resetForm();
    } else {
      const created = await addProduct(payload);
      if (created) resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    await removeProduct(id);
    resetForm();
  };

  return (
    <>
      <span className="flex items-center content-center gap-2 justify-between border-b-2 border-border pb-2 w-full ">
        <CategoryDialog
          categoryId={categoryId}
          categoryName={categoryName}
          setIsSaving={setIsSaving}
          onDeleteCategory={onDeleteCategory}
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" onClick={resetForm}>
              <Plus />
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[90vw] max-w-none bg-[var(--dialog-background)] text-[var(--dialog-foreground)]">
            <DialogTitle className="text-lg font-semibold">
              {selectedProduct ? "Editar Producto" : "Crear Producto"}
            </DialogTitle>

            <ProductForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              price={price}
              setPrice={setPrice}
              discount={discount}
              setDiscount={setDiscount}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              imageFile={imageFile}
              setImageFile={setImageFile}
              sizeInputs={sizeInputs}
              setSizeInputs={setSizeInputs}
              onSave={handleSave}
              onDelete={
                selectedProduct
                  ? () => handleDelete(selectedProduct.id!)
                  : undefined
              }
              setIsSaving={setIsSaving}
              resetForm={resetForm}
              categoryId={categoryId}
            />

            <DialogFooter className="flex justify-end space-x-2">
              <DialogClose asChild>
                {
                  selectedProduct ? (
                    null
                  ) : <Button variant="inverseLight">Cancelar</Button>
                }
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </span>

      <ProductList products={products} onSelect={handleSelectProduct} />
    </>
  );
};
