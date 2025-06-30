import type { Project } from '@/models/projectModel';
import axios from 'axios';

interface ProjectRequest {
  userId: number;
  name: string;
}

interface ProjectAnswerResponse {
  answer: number;
}

const apiUrl = 'http://localhost:8080/api/projects'; // Asegúrate de usar la URL correcta de tu backend

export const createProject = async (
  userId: number,
  name: string,
): Promise<ProjectAnswerResponse> => {
  try {
    const requestPayload: ProjectRequest = {
      userId,
      name,
    };

    // Verifica que la solicitud se está enviando correctamente
    console.log('Enviando solicitud con:', requestPayload);

    const response = await axios.post<ProjectAnswerResponse>(apiUrl, requestPayload, {
      headers: {
        'Content-Type': 'application/json', // Asegúrate de que los encabezados estén bien definidos
      },
    });

    // Verifica la respuesta que estás recibiendo
    console.log('Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creando el proyecto:', error);
    throw error; // Rechaza la promesa si hay un error
  }
};

export const getProjectsByUserId = async (userId: number): Promise<Project[]> => {
  try {
    const response = await axios.get<Project[]>(`${apiUrl}/user/${userId}`);
    console.log('Proyectos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    throw error; // Rechaza la promesa si hay un error
  }
};

export const exportProject = async (
  projectId: string,
  projectName: string,
): Promise<void> => {
  try {
    const response = await axios.get(`${apiUrl}/${projectId}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const contentDisposition = response.headers['content-disposition'];
    let filename = `${projectName || 'project'}.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting project:', error);
    throw error;
  }
};
