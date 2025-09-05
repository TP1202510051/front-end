import React, { useState, useEffect } from "react"
import { Plus, Upload, Save } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { createProduct, getProductsByCategoryId, updateProduct, deleteProduct } from "@/services/product.service"
import type { Product } from '@/models/productModel';
import { updateCategoryName, deleteCategory } from "@/services/category.service";
import { uploadImageToFirebase } from "@/services/firebase.service"

interface ProductDialogProps {
  categoryId: string;
  categoryName?: string;
  setIsSaving?: (isSaving: boolean) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const ProductFormDialog: React.FC<ProductDialogProps> = ({ categoryId, categoryName, setIsSaving, onDeleteCategory }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sizeInputs, setSizeInputs] = useState<string[]>([""])

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editableCategoryName, setEditableCategoryName] = useState(categoryName || "")
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddSize = () => setSizeInputs((prev) => [...prev, ""])

  const handleSizeChange = (idx: number, val: string) => {
    const copy = [...sizeInputs]
    copy[idx] = val
    setSizeInputs(copy)
  }

  const fetchProducts = async () => {
    try {
      const data = await getProductsByCategoryId(Number(categoryId))
      setProducts(data)
    } catch (error) {
      console.error('Error al obtener los productos', error)
    }
  }

  const handleSubmit = async () => {
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
        categoryId,
        sizes: sizeInputs.filter((s) => s.trim() !== "").map((s) => ({ name: s.trim(), isActive: true })),
      };

      if (selectedProduct) {
        const updated = await updateProduct(Number(selectedProduct.id), payload);
        setProducts((prev) => prev.map(p => p.id === updated.id ? updated : p));
        if(updated) {
          console.log("Producto actualizado con éxito:", updated);
          if (setIsSaving) setIsSaving(false);
        }
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [...prev, created]);
        if(created) {
          console.log("Producto creado con éxito:", created);
          if (setIsSaving) setIsSaving(false);
        }
      }

      resetForm();
    } catch (err) {
      console.error("Error creando o actualizando el producto:", err);
    }
  };

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

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter(p => p.id !== selectedProduct?.id));
      if(setIsSaving) setIsSaving(false);
      resetForm();
    } catch (error) {
      console.error("Error eliminando el producto:", error);
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setProducts((prev) => prev.filter(p => p.categoryId !== categoryId));
      setIsCategoryDialogOpen(false);
      if(onDeleteCategory) onDeleteCategory(categoryId);
      if(setIsSaving) setIsSaving(false);
    } catch (error) {
      console.error("Error eliminando la categoría:", error);
    }
  }

  useEffect(() => {
    setProducts([])
    fetchProducts()
    setEditableCategoryName(categoryName || "")
  }, [categoryId, categoryName])

  const handleUpdateCategory = async () => {
    try {
      await updateCategoryName(categoryId, editableCategoryName)
      setIsCategoryDialogOpen(false)
      if (setIsSaving) setIsSaving(false);
    } catch (err) {
      console.error("Error actualizando la categoría:", err)
    }
  }

  return (
    <>
      <span className="flex items-center content-center gap-2 text-white justify-between border-b-2 border-[#343540] pb-2 w-full">
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="flex-1 justify-start text-white font-medium px-2 py-1 hover:bg-[#343540] hover:text-white truncate">
              {editableCategoryName}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E1E1E] text-white rounded-md w-[90vw] max-w-md">
            <DialogTitle className="text-lg">Editar Categoría</DialogTitle>
            <Input
              className="mt-4 text-white bg-[#2C2C2C]"
              value={editableCategoryName}
              onChange={(e) => setEditableCategoryName(e.target.value)}
            />
            <DialogFooter className="pt-4 flex justify-between">
              <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {handleDeleteCategory(categoryId); if (setIsSaving) setIsSaving(true); }}
                >
                  Eliminar
                </Button>
              <Button onClick={() => { handleUpdateCategory(); if (setIsSaving) setIsSaving(true); }} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" onClick={resetForm}>
              <Plus />
            </Button>
          </DialogTrigger>

        <DialogContent className="w-[90vw] max-w-none bg-[#1E1E1E] text-white">
          <DialogTitle className="text-lg font-semibold">
            {selectedProduct ? "Editar Producto" : "Crear Producto"}
          </DialogTitle>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="flex gap-4">
              <div className="w-1/4 relative h-32 border-2 border-dashed border-input rounded-md overflow-hidden group">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Upload className="size-8 text-white" />
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
                  <label className="block mb-1 text-sm font-medium text-white">
                    Nombre
                  </label>
                  <Input
                    placeholder="Nombre..."
                    className="text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-white">
                    Precio
                  </label>
                  <Input
                    placeholder="Precio..."
                    className="text-white"
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
                    className="text-white"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-white">
                    Categoría
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Descripción
              </label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-shadow text-white"
                placeholder="Descripción..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Tallas
              </label>
              <div className="space-y-2">
                {sizeInputs.map((size, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Talla..."
                      className="text-white flex-1"
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
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2">
              {selectedProduct && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => { if (selectedProduct.id) handleDeleteProduct(Number(selectedProduct.id)); if (setIsSaving) setIsSaving(true); }}
                >
                  Eliminar
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" onClick={() => { if (setIsSaving) setIsSaving(true); }}>Aceptar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </span>
      {products.map((product) => (
        <div key={product.id} className="rounded flex flex-col pt-2 gap-2">
          <Button
            className="transition-colors cursor-pointer text-left justify-start bg-transparent hover:bg-[#343540] text-white hover:font-semibold"
            onClick={() => {
              setSelectedProduct(product)
              setName(product.name)
              setDescription(product.description)
              setPrice(String(product.price))
              setDiscount(String(product.discount))
              setImageUrl(product.image)
              setSizeInputs(product.sizes?.map(s => s.name) || [])
              setIsOpen(true)
            }}
          >
            {product.name}
          </Button>
        </div>
      ))}
    </>
  )
}  
