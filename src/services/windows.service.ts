import type { AppWindow } from "@/models/windowModel";
import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

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
    const resp = await api.post<WindowResponse>("/windows", payload);
    return resp.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWindowsByProjectId = async (
  projectId: number
): Promise<AppWindow[]> => {
  try {
    const response = await api.get<AppWindow[]>(`/windows/project/${projectId}`);
    return response.data;
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
    const payload = { name };
    await api.put(`/windows/${windowId}`, payload);
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
