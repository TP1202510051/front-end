import type { Message } from '@/models/messageModel';
import axios from 'axios';

interface MessageRequest {
  message: string;
  windowId: number;
  projectId: number;
}

interface Response {
  answer: string;
}

const apiBroker = import.meta.env.VITE_CLOUD_RUN_URL;

export const createMessage = async (windowId: number, message: string, projectId: number): Promise<Response> => {
  try {
    const requestPayload: MessageRequest = {
      message,
      windowId,
      projectId,
    };

    console.log("Enviando solicitud con:", requestPayload);

    const response = await axios.post<Response>(apiBroker, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log("Respuesta del backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creando el proyecto:", error);
    throw error;
  }
};

const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/messages`; 


export const getMessagesByWindowId = async (windowId: number): Promise<Message[]> => {
    try {
      const response = await axios.get<Message[]>(`${apiUrl}/${windowId}`);
      console.log("mensajes obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo mensajes:", error);
      throw error;
    }
  };