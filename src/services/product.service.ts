import type { Product } from '@/models/productModel'
import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  headers: { 'Content-Type': 'application/json' },
})

export const createProduct = async (
  payload: Product
): Promise<Product> => {
  const resp = await api.post<Product>('/products', payload)
  return resp.data
}

export const getProductsByCategoryId = async (
  categoryId: number
): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/products/category/${categoryId}`);
    console.log('Productos obtenidoss:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: number,
  payload: Product
): Promise<Product> => {
  console.log(payload);
  const resp = await api.put<Product>(`/products/${productId}`, payload)
  return resp.data
}

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/products/${productId}`)
}