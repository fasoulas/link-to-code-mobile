export interface SavedUrl {
  id: string;
  url: string;
  title: string;
  createdAt: Date;
  isActive: boolean;
}

export interface UrlFormData {
  url: string;
  title: string;
}