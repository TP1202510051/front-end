// Interface para la solicitud de creación de un proyecto
export interface ProjectRequest {
  userId: number;
  name: string;
}

// Interface para la respuesta de creación de un proyecto
export interface ProjectAnswerResponse {
  answer: string;
}

// Interface para la solicitud de obtener proyectos por userId
export interface UserIdRequest {
  userId: number;
}

// Interface para los proyectos (usada en GetProjectByUserId)
export interface ProjectP {
  id: number;
  name: string;
  createdAt: string;
}

// Interface para la respuesta de los proyectos
export interface ProjectResponse {
  projects: ProjectP[];
}
