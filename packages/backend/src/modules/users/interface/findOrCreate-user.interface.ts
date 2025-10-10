export interface FindOrCreateUserInterface {
    id: number;
    name: string;
    avatar?: string;
    email?: string | null;
    githubUserId: string;
    createdAt?: Date;
    updatedAt?: Date;
}