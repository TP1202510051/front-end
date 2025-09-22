import type { Code } from "@/models/codeModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

const apiUrl = "/codes";

export const getLatestCodeByWindowId = async (
  windowId: number
): Promise<Code> => {
  try {
    const { data } = await api.get<Code>(`${apiUrl}/windows/latest/${windowId}`);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_CODE_FOUND"]);
    throw error;
  }
};

const apiUrl2 = "/component-codes";

export const getLatestCodeByComponentId = async (
  componentId: number
): Promise<Code> => {
  try {
    const { data } = await api.get<Code>(
      `${apiUrl2}/component/latest/${componentId}`
    );
    return data;
  } catch (error) {
    handleApiError(error, ["NO_COMPONENT_CODE_FOUND"]);
    throw error;
  }
};
