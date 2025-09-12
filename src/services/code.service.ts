import type { Code } from "@/models/codeModel";
import axios from "axios";
import { handleApiError } from "@/utils/handlers/errorHandler";

const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/codes`;

export const getLatestCodeByWindowId = async (
  windowId: number
): Promise<Code> => {
  try {
    const response = await axios.get<Code>(`${apiUrl}/windows/latest/${windowId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, ["NO_CODE_FOUND"]);
    throw error;
  }
};