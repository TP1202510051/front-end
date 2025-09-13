import api from "@/utils/interceptors/authInterceptor";
import type { Category } from "@/models/categoryModel";
import { handleApiError } from "@/utils/handlers/errorHandler";

export interface CreateCategoryRequest {
  name: string;
  projectId: number;
}

const apiUrl = "/categories";

export const createCategory = async (
  projectId: number,
  name: string
): Promise<Category> => {
  try {
    const payload: CreateCategoryRequest = { name, projectId };
    const { data } = await api.post<Category>(apiUrl, payload);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getCategoriesByProjectId = async (
  projectId: number
): Promise<Category[]> => {
  try {
    const { data } = await api.get<Category[]>(`${apiUrl}/project/${projectId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_CATEGORIES"]);
    throw error;
  }
};

export const updateCategoryName = async (
  categoryId: string,
  newName: string
): Promise<Category> => {
  try {
    const { data } = await api.put<Category>(`${apiUrl}/${categoryId}`, { name: newName });
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await api.delete(`${apiUrl}/${categoryId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
