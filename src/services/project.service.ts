import type { Project } from "@/models/projectModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

interface ProjectRequest {
  userId: string;
  name: string;
}

interface ProjectAnswerResponse {
  answer: number;
}

const apiUrl = "/projects";

export const createProject = async (
  userId: string,
  name: string
): Promise<ProjectAnswerResponse> => {
  try {
    const requestPayload: ProjectRequest = { userId, name };
    const { data } = await api.post<ProjectAnswerResponse>(apiUrl, requestPayload);
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getProjectsByUserId = async (): Promise<Project[]> => {
  try {
    const { data } = await api.get<Project[]>(`${apiUrl}/user`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_PROJECTS"]);
    throw error;
  }
};

export const exportProject = async (projectId: string, projectName: string): Promise<void> => {
  try {
    const response = await api.get(`${apiUrl}/${projectId}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let filename = `${projectName || "project"}.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateProjectName = async (
  projectId: string,
  newName: string
): Promise<void> => {
  try {
    await api.put(`${apiUrl}/${projectId}`, { name: newName });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await api.delete(`${apiUrl}/${projectId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
