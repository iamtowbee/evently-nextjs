export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          slug: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          bio: string | null;
          role: string;
          website: string | null;
          twitter: string | null;
          github: string | null;
          linkedin: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          bio?: string | null;
          role?: string;
          website?: string | null;
          twitter?: string | null;
          github?: string | null;
          linkedin?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          bio?: string | null;
          role?: string;
          website?: string | null;
          twitter?: string | null;
          github?: string | null;
          linkedin?: string | null;
        };
      };
      communities: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          creator_id: string | null;
          is_private: boolean;
          member_count: number;
          event_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          creator_id?: string | null;
          is_private?: boolean;
          member_count?: number;
          event_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          creator_id?: string | null;
          is_private?: boolean;
          member_count?: number;
          event_count?: number;
        };
      };
      community_members: {
        Row: {
          id: string;
          created_at: string;
          community_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          community_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          community_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      events: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          description: string | null;
          location: string | null;
          venue: string | null;
          date: string;
          start_time: string;
          end_time: string;
          category_id: string | null;
          image_url: string | null;
          is_featured: boolean;
          is_free: boolean;
          price: number | null;
          max_attendees: number | null;
          attendee_count: number;
          organizer_id: string | null;
          community_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          description?: string | null;
          location?: string | null;
          venue?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          category_id?: string | null;
          image_url?: string | null;
          is_featured?: boolean;
          is_free?: boolean;
          price?: number | null;
          max_attendees?: number | null;
          attendee_count?: number;
          organizer_id?: string | null;
          community_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          location?: string | null;
          venue?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          category_id?: string | null;
          image_url?: string | null;
          is_featured?: boolean;
          is_free?: boolean;
          price?: number | null;
          max_attendees?: number | null;
          attendee_count?: number;
          organizer_id?: string | null;
          community_id?: string | null;
        };
      };
      virtual_events: {
        Row: {
          id: string;
          created_at: string;
          event_id: string;
          platform: string;
          url: string;
          meeting_id: string | null;
          passcode: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_id: string;
          platform: string;
          url: string;
          meeting_id?: string | null;
          passcode?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_id?: string;
          platform?: string;
          url?: string;
          meeting_id?: string | null;
          passcode?: string | null;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          created_at: string;
          event_id: string;
          user_id: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_id: string;
          user_id: string;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_id?: string;
          user_id?: string;
          status?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
