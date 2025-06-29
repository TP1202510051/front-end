// src/components/ProductFormDialog.tsx
import React, { useState, useEffect } from "react"
import { Plus, Upload } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { createProduct, getProductsByCategoryId } from "@/services/product.service"
import type { Product } from '@/models/productModel';


interface ProductDialogProps {
  categoryId: string;
}
export const ProductFormDialog: React.FC<ProductDialogProps> = ({ categoryId }: ProductDialogProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [discount, setDiscount] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [products, setProducts] = useState<Product[]>([]);

    const [sizeInputs, setSizeInputs] = useState<string[]>([""])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => setImageUrl(reader.result as string)
      reader.readAsDataURL(file)
    }

    const handleAddSize = () => {
      setSizeInputs((prev) => [...prev, ""])
    }

    const handleSizeChange = (idx: number, val: string) => {
      setSizeInputs((prev) => {
        const copy = [...prev]
        copy[idx] = val
        return copy
      })
    }

    const fetchProducts = async () => {
      try {
        const data = await getProductsByCategoryId(Number(categoryId));
        setProducts(data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    const handleSubmit = async () => {
    const payload: Product = {
      name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount),
      image: imageUrl,
      categoryId,
      sizes: sizeInputs
          .filter((s) => s.trim() !== "")
          .map((s) => ({ name: s.trim(), isActive: true })),
    }

    try {
      const created = await createProduct(payload)
      console.log("Producto creado:", created)
      // cerrar diálogo o refrescar lista...
    } catch (err) {
      console.error("Error creando el producto:", err)
    }
  }
  
  useEffect(() => {
    setProducts([]);
    fetchProducts();
  }, [categoryId]);

  return (
    <>
    <span className="text-md font-medium">Products:</span>
      {products.map((product) => (
        <div className="p-4 border rounded shadow flex flex-col gap-2">
          <span className="text-sm font-medium">{product.name}</span>
        </div>
      ))}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" size="default">
            Nuevo producto
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[90vw] max-w-none bg-[#1E1E1E] text-white">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="flex gap-4">
              <div className="w-1/4 relative h-32 border-2 border-dashed border-input rounded-md flex items-center justify-center">
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
                <Upload className="size-8 text-muted-foreground" />
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
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Aceptar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
