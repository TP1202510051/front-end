import type { Product } from "@/models/productModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

export const createProduct = async (payload: Product): Promise<Product> => {
  try {
    const { data } = await api.post<Product>("/products", payload);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getProductsByCategoryId = async (
  categoryId: number
): Promise<Product[]> => {
  try {
    const { data } = await api.get<Product[]>(`/products/category/${categoryId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_PRODUCTS"]);
    throw error;
  }
};

export const updateProduct = async (
  productId: number,
  payload: Product
): Promise<Product> => {
  try {
    const { data } = await api.put<Product>(`/products/${productId}`, payload);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteProduct = async (productId: number): Promise<void> => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
