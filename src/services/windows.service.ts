import type { AppWindow } from "@/models/windowModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

export interface CreateWindowRequest {
  name: string;
  projectId: number;
}

export interface WindowResponse {
  id: string;
  name: string;
  createdAt: string;
  projectId: number;
}

export const createWindow = async (
  projectId: number,
  name: string
): Promise<WindowResponse> => {
  try {
    const payload: CreateWindowRequest = { name, projectId };
    const { data } = await api.post<WindowResponse>("/windows", payload);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWindowsByProjectId = async (
  projectId: number
): Promise<AppWindow[]> => {
  try {
    const { data } = await api.get<AppWindow[]>(`/windows/project/${projectId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_WINDOWS"]);
    throw error;
  }
};

export const updateWindowName = async (
  windowId: string,
  name: string
): Promise<void> => {
  try {
    await api.put(`/windows/${windowId}`, { name });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteWindow = async (windowId: string): Promise<void> => {
  try {
    await api.delete(`/windows/${windowId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
