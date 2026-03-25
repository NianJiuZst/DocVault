export interface DocumentInfo {
  id: number;
  title: string;
  content: object;
  userId: number;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentListItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: DocumentListItem[];
}
