import type { Code } from '@/models/codeModel';
import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/codes'; 

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