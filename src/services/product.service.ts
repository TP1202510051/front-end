// src/services/productService.ts
import axios from 'axios'

/** DTO para crear una talla en la petición */
export interface SizeDto {
  name: string
  isActive: boolean
}

/** DTO para crear un producto */
export interface CreateProductRequest {
  name: string
  description: string
  price: number
  discount: number
  image: string
  category: string
 projectId: number // ID del proyecto al que pertenece el producto
  sizes: SizeDto[]        // enviamos un arreglo de objetos SizeDto
}

/** Respuesta al crear un producto */
export interface ProductResponse {
  id: number
  name: string
  // …otros campos si tu API los devuelve
}

/** Modelo de una talla (tal como se recibe de la API) */
export interface Size {
  name: string
  isActive: boolean
}

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

/** Trae todas las tallas activas */
export const getSizes = async (): Promise<Size[]> => {
  const resp = await api.get<Size[]>('/sizes')
  console.log('Tallas obtenidas:', resp.data)
  return resp.data
}

/** Crea un producto enviando CreateProductRequest */
export const createProduct = async (
  payload: CreateProductRequest
): Promise<ProductResponse> => {
  console.log('Enviando CreateProductRequest:', payload)
  const resp = await api.post<ProductResponse>('/products', payload)
  console.log('Producto creado:', resp.data)
  return resp.data
}