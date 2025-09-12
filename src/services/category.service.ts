// src/services/category.service.ts
import axios from "axios";
import type { Category } from "@/models/categoryModel";
import { handleApiError } from "@/utils/handlers/errorHandler";

export interface CreateCategoryRequest {
  name: string;
  projectId: number;
}

const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/categories`;

export const createCategory = async (
  projectId: number,
  name: string
): Promise<Category> => {
  try {
    const payload: CreateCategoryRequest = { name, projectId };
    const { data } = await axios.post<Category>(apiUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });
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
    const { data } = await axios.get<Category[]>(`${apiUrl}/project/${projectId}`);
    return data;
  } catch (error) {
    // silencioso si el proyecto no tiene categorías
    handleApiError(error, ["NO_CATEGORIES"]);
    throw error;
  }
};

export const updateCategoryName = async (
  categoryId: string,
  newName: string
): Promise<Category> => {
  try {
    const { data } = await axios.put<Category>(
      `${apiUrl}/${categoryId}`,
      { name: newName },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await axios.delete(`${apiUrl}/${categoryId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
