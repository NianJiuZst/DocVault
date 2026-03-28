export type ShareRole = "viewer" | "editor";

export type ExportFormat = "markdown" | "pdf";

export interface DocumentDetails {
	id: number;
	title: string;
	content: any;
	userId: number;
	parentId: number | null;
	isPublic: boolean;
	shareToken: string | null;
}

export interface DocumentShare {
	id: number;
	userId: number;
	permission: ShareRole;
	user: {
		id: number;
		name: string;
		avatar: string;
	};
}

export interface ActionMessage {
	tone: "success" | "error" | "info";
	text: string;
}
