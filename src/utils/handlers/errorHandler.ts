import { toast } from "react-toastify";
import type { ApiError } from "@/models/apiError";
import axios from "axios";

export function handleApiError(error: unknown, silentErrorCodes: string[] = []) {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;

    // si el error está en la lista de silenciosos, no muestres toast
    if (!silentErrorCodes.includes(apiError.errorCode)) {
      toast.error(apiError.message || "Ocurrió un error inesperado");
    }
    throw apiError; // importante: relanza para que el flujo sepa que falló
  } else {
    toast.error("Error de red o desconocido");
    throw error;
  }
}
