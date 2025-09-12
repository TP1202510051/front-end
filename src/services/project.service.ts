import type { Project } from "@/models/projectModel";
import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";

interface ProjectRequest {
  userId: string;
  name: string;
}

interface ProjectAnswerResponse {
  answer: number;
}

const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/projects`;

export const createProject = async (
  userId: string,
  name: string
): Promise<ProjectAnswerResponse> => {
  try {
    const requestPayload: ProjectRequest = { userId, name };
    const response = await axios.post<ProjectAnswerResponse>(apiUrl, requestPayload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getProjectsByUserId = async (userId: string): Promise<Project[]> => {
  try {
    const response = await axios.get<Project[]>(`${apiUrl}/user/${userId}`);
    return response.data;
  } catch (error) {
    // caso silencioso: usuario sin proyectos
    handleApiError(error, ["NO_PROJECTS"]);
    throw error;
  }
};

export const exportProject = async (
  projectId: string,
  projectName: string
): Promise<void> => {
  try {
    const response = await axios.get(`${apiUrl}/${projectId}/download`, {
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
    await axios.put(
      `${apiUrl}/${projectId}`,
      { name: newName },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await axios.delete(`${apiUrl}/${projectId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
