import api from "@/utils/interceptors/authInterceptor";
import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";
import type { Message } from "@/models/messageModel";

interface MessageRequest {
  message: string;
  projectId?: string | null;
  windowId?: string | null;
  componentId?: string | null;
}

interface Response {
  answer: string;
}

const apiBroker = import.meta.env.VITE_CLOUD_RUN_URL;
const apiUrl = "/messages";

export const createMessage = async (payload: MessageRequest): Promise<Response> => {
  try {
    console.log("Sending message payload:", payload);
    const response = await axios.post<Response>(apiBroker, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Received response:", response.data);
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
    const { data } = await api.get<Message[]>(`${apiUrl}/window/${windowId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_MESSAGES"]);
    throw error;
  }
};

export const getMessagesByProjectId = async (
  projectId: number
): Promise<Message[]> => {
  try {
    const { data } = await api.get<Message[]>(`${apiUrl}/project/${projectId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_MESSAGES"]);
    throw error;
  }
};

export const getMessagesByComponentId = async (
  componentId: number
): Promise<Message[]> => {
  try {
    const { data } = await api.get<Message[]>(`${apiUrl}/component/${componentId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_MESSAGES"]);
    throw error;
  }
};
