import type { Message } from '@/models/messageModel';
import axios from 'axios';

interface MessageRequest {
  projectId: number;
  message: string;
}

interface Response {
  answer: string;
}

const apiBroker = 'https://sender-to-broker-function-614278839638.europe-west1.run.app';

export const createMessage = async (projectId: number, message: string): Promise<Response> => {
  try {
    const requestPayload: MessageRequest = {
      projectId,
      message,
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

const apiUrl = 'http://localhost:8080/api/messages'; 


export const getMessagesByProjectId = async (projectId: number): Promise<Message[]> => {
    try {
      const response = await axios.get<Message[]>(`${apiUrl}/${projectId}`);
      console.log("Proyectos obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo proyectos:", error);
      throw error;  // Rechaza la promesa si hay un error
    }
  };