import React from "react";
import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/models/productModel";
import { uploadImageToFirebase } from "@/services/firebase.service";
import { toast } from "react-toastify";

interface Props {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  sizeInputs: string[];
  setSizeInputs: (s: string[]) => void;
  onSave: (payload: Product) => Promise<void>;
  onDelete?: () => Promise<void>;
  setIsSaving?: (s: boolean) => void;
  resetForm: () => void;
  categoryId: string;
}

export const ProductForm: React.FC<Props> = ({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  discount,
  setDiscount,
  imageUrl,
  setImageUrl,
  imageFile,
  setImageFile,
  sizeInputs,
  setSizeInputs,
  onSave,
  onDelete,
  setIsSaving,
  categoryId,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddSize = () => setSizeInputs([...sizeInputs, ""]);
  const handleSizeChange = (idx: number, val: string) => {
    const copy = [...sizeInputs];
    copy[idx] = val;
    setSizeInputs(copy);
  };

  const handleSubmit = async () => {
    setIsSaving?.(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImageToFirebase(imageFile);
      }

      const payload: Product = {
        name,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount),
        image: finalImageUrl,
        categoryId: categoryId,
        sizes: sizeInputs
          .filter((s) => s.trim() !== "")
          .map((s) => ({ name: s.trim(), isActive: true })),
      };

      await onSave(payload);
    } catch (err) {
      toast.error(`Error guardando producto: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving?.(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="flex gap-4">
        <div className="w-1/4 relative h-32 border-2 border-dashed border-input rounded-md overflow-hidden group">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 transition-opacity flex items-center justify-center pointer-events-none">
            <Upload className="size-8" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className="block mb-1 text-sm font-medium">
              Nombre
            </label>
            <Input
              placeholder="Nombre..."
              className=""
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Precio
            </label>
            <Input
              placeholder="Precio..."
              className=""
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Descuento
            </label>
            <Input
              placeholder="Descuento..."
              className=""
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Categoría
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Descripción
        </label>
        <textarea
          rows={4}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-shadow"
          placeholder="Descripción..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Tallas
        </label>
        <div className="space-y-2">
          {sizeInputs.map((size, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Talla..."
                className="flex-1"
                value={size}
                onChange={(e) => handleSizeChange(idx, e.target.value)}
              />
              {idx === sizeInputs.length - 1 && (
                <Button
                  type="button"
                  onClick={handleAddSize}
                  variant="ghost"
                  size="icon"
                  className="p-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="inverseDark">Aceptar</Button>
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
};
