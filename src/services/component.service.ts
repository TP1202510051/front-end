import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

export interface Component {
  id: string;
  name: string;
  windowId: string;
  createdAt: string;
}

const apiUrl = "/components";

export const getComponentsByWindowId = async (
  windowId: number
): Promise<Component[]> => {
  try {
    const { data } = await api.get<Component[]>(`${apiUrl}/window/${windowId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_COMPONENTS_FOUND"]);
    throw error;
  }
};