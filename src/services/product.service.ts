import type { Product } from "@/models/productModel";
import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  headers: { "Content-Type": "application/json" },
});

export const createProduct = async (payload: Product): Promise<Product> => {
  try {
    const resp = await api.post<Product>("/products", payload);
    return resp.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getProductsByCategoryId = async (
  categoryId: number
): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    // silencioso si la categoría no tiene productos
    handleApiError(error, ["NO_PRODUCTS"]);
    throw error;
  }
};

export const updateProduct = async (
  productId: number,
  payload: Product
): Promise<Product> => {
  try {
    const resp = await api.put<Product>(`/products/${productId}`, payload);
    return resp.data;
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
