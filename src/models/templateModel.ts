export interface Template {
    id: number;
    name: string;
    description?: string;
    image?: string;
    windows?: [
        id?: number,
        name?: string,
        position?: number,
        code?: string,
    ]
}

export interface TemplateRequest {
    templateId: number;
    userId: string;
}

export interface TemplateResponse {
    projectId: number;
    projectName: string;
}
    