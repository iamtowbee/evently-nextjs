export interface Event {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  venue: string | null;
  date: Date;
  start_time: string;
  end_time: string;
  image_url: string | null;
  is_featured: boolean;
  is_free: boolean;
  price: number | null;
  max_attendees: number | null;
  attendee_count: number;
  category_id: string | null;
  organizer_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  organizer?: {
    id: string;
    name: string;
  };
  _count?: {
    attendees: number;
  };
}

export type EventResponse = {
  events: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
};
