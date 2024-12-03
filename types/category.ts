export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: Date;
  event_count?: number;
}
