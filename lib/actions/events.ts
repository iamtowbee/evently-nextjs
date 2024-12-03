import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class EventError extends Error {
  constructor(
    message: string,
    public code:
      | "NOT_FOUND"
      | "EVENT_FULL"
      | "ALREADY_REGISTERED"
      | "REGISTRATION_FAILED"
      | "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "EventError";
  }
}

export async function registerForEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new EventError("User not authenticated", "UNAUTHORIZED");
  }

  try {
    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from("event_attendees")
      .select()
      .eq("user_id", session.user.id)
      .eq("event_id", eventId)
      .single();

    if (existingRegistration) {
      throw new EventError(
        "Already registered for this event",
        "ALREADY_REGISTERED"
      );
    }

    // Get event details and check availability
    const { data: event } = await supabase
      .from("virtual_events")
      .select()
      .eq("id", eventId)
      .single();

    if (!event) {
      throw new EventError("Event not found", "NOT_FOUND");
    }

    // Check if event is full
    if (event.max_attendees && event.attendee_count >= event.max_attendees) {
      throw new EventError("Event has reached maximum capacity", "EVENT_FULL");
    }

    // Create registration
    const { data: registration, error: registrationError } = await supabase
      .from("event_attendees")
      .insert({
        user_id: session.user.id,
        event_id: eventId,
        status: "registered",
      })
      .select()
      .single();

    if (registrationError || !registration) {
      throw new EventError(
        "Failed to create registration",
        "REGISTRATION_FAILED"
      );
    }

    // Update attendee count
    await supabase
      .from("virtual_events")
      .update({ attendee_count: event.attendee_count + 1 })
      .eq("id", eventId);

    return registration;
  } catch (error) {
    if (error instanceof EventError) {
      throw error;
    }
    throw new EventError("Registration failed", "REGISTRATION_FAILED");
  }
}

export async function getEventWithAttendees(eventId: string) {
  const { data: event, error: eventError } = await supabase
    .from("virtual_events")
    .select(
      `
      *,
      community:community_id (
        name,
        avatar_url
      ),
      creator:creator_id (
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new EventError("Event not found", "NOT_FOUND");
  }

  const { data: attendees } = await supabase
    .from("event_attendees")
    .select(
      `
      *,
      profile:user_id (
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  return {
    ...event,
    attendees: attendees || [],
  };
}

export async function getUserEvents() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new EventError("User not authenticated", "UNAUTHORIZED");
  }

  // Get events user is attending
  const { data: attending } = await supabase
    .from("event_attendees")
    .select(
      `
      status,
      event:event_id (
        *,
        community:community_id (
          name,
          avatar_url
        ),
        creator:creator_id (
          username,
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Get events user is hosting
  const { data: hosting } = await supabase
    .from("virtual_events")
    .select(
      `
      *,
      community:community_id (
        name,
        avatar_url
      )
    `
    )
    .eq("creator_id", session.user.id)
    .order("created_at", { ascending: false });

  return {
    attending:
      attending?.map((a) => ({
        ...a.event,
        attendance_status: a.status,
      })) || [],
    hosting: hosting || [],
  };
}

export async function createEvent(
  data: Omit<
    Database["public"]["Tables"]["virtual_events"]["Insert"],
    "id" | "created_at" | "updated_at" | "attendee_count" | "creator_id"
  >
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new EventError("User not authenticated", "UNAUTHORIZED");
  }

  const { data: event, error } = await supabase
    .from("virtual_events")
    .insert({
      ...data,
      creator_id: session.user.id,
      attendee_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return event;
}

// Real-time subscription helper
export function subscribeToEvent(
  eventId: string,
  callback: (payload: {
    event?: Database["public"]["Tables"]["virtual_events"]["Row"];
    attendees?: Database["public"]["Tables"]["event_attendees"]["Row"][];
  }) => void
) {
  return supabase
    .channel(`event:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "virtual_events",
        filter: `id=eq.${eventId}`,
      },
      (payload) => {
        callback({
          event:
            payload.new as Database["public"]["Tables"]["virtual_events"]["Row"],
        });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_attendees",
        filter: `event_id=eq.${eventId}`,
      },
      async () => {
        // Fetch updated attendees list
        const { data } = await supabase
          .from("event_attendees")
          .select(
            `
            *,
            profile:user_id (
              username,
              full_name,
              avatar_url
            )
          `
          )
          .eq("event_id", eventId);
        callback({ attendees: data || [] });
      }
    )
    .subscribe();
}
