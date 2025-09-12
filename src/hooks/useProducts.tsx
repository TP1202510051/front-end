import { useState, useCallback } from "react";
import { getProductsByCategoryId, createProduct, updateProduct, deleteProduct } from "@/services/product.service";
import type { Product } from "@/models/productModel";
import { toast } from "react-toastify";

export function useProducts(categoryId: string, setIsSaving?: (s: boolean) => void) {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProductsByCategoryId(Number(categoryId));
      setProducts(data);
    } catch (err) {
      toast.error(`Error al obtener los productos: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [categoryId]);

  const addProduct = useCallback(async (payload: Product) => {
    setIsSaving?.(true);
    try {
      const created = await createProduct(payload);
      setProducts((prev) => [...prev, created]);
      return created;
    } finally {
      setIsSaving?.(false);
    }
  }, [setIsSaving]);

  const editProduct = useCallback(async (id: number, payload: Product) => {
    setIsSaving?.(true);
    try {
      const updated = await updateProduct(id, payload);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    } finally {
      setIsSaving?.(false);
    }
  }, [setIsSaving]);

  const removeProduct = useCallback(async (id: string) => {
    setIsSaving?.(true);
    try {
      await deleteProduct(Number(id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setIsSaving?.(false);
    }
  }, [setIsSaving]);

  return { products, setProducts, fetchProducts, addProduct, editProduct, removeProduct };
}
