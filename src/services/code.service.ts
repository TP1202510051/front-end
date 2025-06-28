import type { Code } from '@/models/codeModel';
import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/codes'; 

export const getLatestCodeByProjectId= async (projectId: number): Promise<Code> => {
    try {
      const response = await axios.get<Code>(`${apiUrl}/project/latest/${projectId}`);
      console.log("Codigos obtenidos:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo codigos:", error);
      throw error;
    }
  };