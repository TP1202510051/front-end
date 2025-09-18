export interface Message {
  id: string;
  content: string;
  createdAt: string;
  type: "prompt" | "response" | "system";
  projectId?: number;
  windowId?: number;
  componentId?: number;
}