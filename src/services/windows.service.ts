import type { Window } from '@/models/windowModel';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export interface CreateWindowRequest {
  name: string
  projectId: number
}

export interface WindowResponse {
    id: string
    windowName: string
    createdAt: string
    projectId: number
}

export const createWindow = async (
    projectId: number,
    name: string
): Promise<WindowResponse> => {
    const payload: CreateWindowRequest = {
      name,
      projectId,
    };
  console.log('Enviando CreateWindowRequest:', payload)
  const resp = await api.post<WindowResponse>('/windows', payload)
  console.log('Ventana creada:', resp.data)
  return resp.data
}

export const getWindowsByProjectId = async (
  projectId: number
): Promise<Window[]> => {
  try {
    const response = await api.get<Window[]>(`/windows/project/${projectId}`);
    console.log('Ventanas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo ventanas:', error);
    throw error;
  }
};