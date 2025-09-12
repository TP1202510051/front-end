export interface ApiError {
  status: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  errors: Record<string, string[]> | null;
}