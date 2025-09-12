import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";
import type { Message } from "@/models/messageModel";

interface MessageRequest {
  message: string;
  windowId: number;
  projectId: number;
}

interface Response {
  answer: string;
}

const apiBroker = import.meta.env.VITE_CLOUD_RUN_URL;
const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/messages`;

export const createMessage = async (
  windowId: number,
  message: string,
  projectId: number
): Promise<Response> => {
  try {
    const requestPayload: MessageRequest = { message, windowId, projectId };

    const response = await axios.post<Response>(apiBroker, requestPayload, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getMessagesByWindowId = async (
  windowId: number
): Promise<Message[]> => {
  try {
    const response = await axios.get<Message[]>(`${apiUrl}/${windowId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, ["NO_MESSAGES"]); 
    throw error;
  }
};