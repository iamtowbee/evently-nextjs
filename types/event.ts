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
  tags?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  organizer?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  _count?: {
    attendees: number;
  };
  attendees?: {
    id: string;
    name: string | null;
    image: string | null;
  }[];
}

export type EventResponse = {
  events: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export type EventActionResult =
  | { success: true; event: Event | null; message?: string }
  | { success: false; event: null; error: string };
