import type { Product } from '@/models/productModel'
import axios from 'axios'

export interface ProductResponse {
  id: number
  name: string
}

export interface Size {
  name: string
  isActive: boolean
}

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export const getSizes = async (): Promise<Size[]> => {
  const resp = await api.get<Size[]>('/sizes')
  console.log('Tallas obtenidas:', resp.data)
  return resp.data
}

export const createProduct = async (
  payload: Product
): Promise<ProductResponse> => {
  console.log('Enviando CreateProductRequest:', payload)
  const resp = await api.post<ProductResponse>('/products', payload)
  console.log('Producto creado:', resp.data)
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