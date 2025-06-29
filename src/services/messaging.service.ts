import type { Message } from '@/models/messageModel';
import axios from 'axios';

interface MessageRequest {
  windowId: number;
  message: string;
}

interface Response {
  answer: string;
}

const apiBroker = 'https://sender-to-broker-function-614278839638.europe-west1.run.app';

export const createMessage = async (windowId: number, message: string): Promise<Response> => {
  try {
    const requestPayload: MessageRequest = {
      windowId,
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