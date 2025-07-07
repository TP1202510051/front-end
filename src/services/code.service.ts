import type { Code } from '@/models/codeModel';
import axios from 'axios';

const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/codes`; 

export const getLatestCodeByWindowId= async (windowId: number): Promise<Code> => {
    try {
      const response = await axios.get<Code>(`${apiUrl}/windows/latest/${windowId}`);
      console.log("Codigos obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo codigos:", error);
      throw error;
    }
  };