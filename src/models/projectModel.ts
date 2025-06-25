export interface Project {
    id: string;
    projectName: string;
    userId: number;
    createdAt: string;
    lastEdited: string | null;
    imageUrl: string | null;
}