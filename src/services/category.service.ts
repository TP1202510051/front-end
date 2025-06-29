import type { Category } from "@/models/categoryModel"
import axios from "axios"

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export interface CreateCategoryRequest {
  name: string
  projectId: number
}

export interface CategoryResponse {
    id: string
    categoryName: string
    createdAt: string
    projectId: number
}

export const createCategory = async (
    projectId: number,
    name: string
): Promise<CategoryResponse> => {
    const payload: CreateCategoryRequest = {
      name,
      projectId,
    };
  console.log('Enviando CreateCategoryRequest:', payload)
  const resp = await api.post<CategoryResponse>('/categories', payload)
  console.log('Categoria creada:', resp.data)
  return resp.data
}

export const getCategoriesByProjectId = async (
  projectId: number
): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>(`/categories/project/${projectId}`);
    console.log('Categorias obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ventanas:', error);
    throw error;
  }
};