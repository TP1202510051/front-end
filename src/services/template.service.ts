import type { Template, TemplateRequest, TemplateResponse } from "@/models/templateModel";
import api from "@/utils/interceptors/authInterceptor";
import { handleApiError } from "@/utils/handlers/errorHandler";

const apiUrl = "/templates";

export const getTemplates = async (): Promise<Template[]> => {
  try {
    const { data } = await api.get<Template[]>(`${apiUrl}`);
    console.log(data);
    return data;
  } catch (error) {
    handleApiError(error, ["NO_TEMPLATES"]);
    throw error;
  }
};

export const setTemplate = async (template: TemplateRequest): Promise<TemplateResponse> => {
    console.log(template);
  try {
    const { data } = await api.post<TemplateResponse>(`${apiUrl}/apply`, template);
    console.log(data);
    return data;
  } catch (error) {
    handleApiError(error, ["TEMPLATE_NOT_CREATED"]);
    throw error;
  }
};