import type { Project } from "@/models/projectModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";
import { createStoreProject, deleteStoreProject, listProjects, renameStoreProject } from '@/api/projects';
import { publicProblem } from '@/api/problems';

const apiUrl = "/projects";

export const createProject = async (
  name: string
): Promise<string> => {
  return (await createStoreProject(name)).id;
};

export const getProjectsByUserId = async (): Promise<Project[]> => {
  const projects: Project[] = [];
  const seen = new Set<string>();
  let after: string | undefined;
  do {
    const page = await listProjects(after);
    projects.push(...page.items);
    after = page.nextCursor ?? undefined;
    if (after && seen.has(after)) throw publicProblem(null);
    if (after) seen.add(after);
  } while (after);
  return projects;
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
  await renameStoreProject(projectId, newName);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await deleteStoreProject(projectId);
};
