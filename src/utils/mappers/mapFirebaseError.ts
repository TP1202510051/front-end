import { REGISTER_ERRORS } from "../constants/REGISTER_ERRORS";

export function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string }).code;
  return REGISTER_ERRORS[code ?? ""] || REGISTER_ERRORS.default;
}
