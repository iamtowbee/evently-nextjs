"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { EventActionResult } from "@/types/event";
import { slugify, withErrorHandling } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { cache } from "react";

export type GetEventsParams = {
  query?: string;
  category?: string;
  limit?: number;
  cursor?: string;
  sort?: string;
  featured?: boolean;
};

export const getEvents = cache(
  async ({
    query,
    category,
    limit = 6,
    cursor,
    sort = "date",
    featured = false,
  }: GetEventsParams = {}) => {
    const where: Prisma.EventWhereInput = {};

    if (category) {
      where.category = { slug: category };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (featured) {
      where.is_featured = true;
    }

    const result = await withErrorHandling(
      async () => {
        const events = await prisma.event.findMany({
          where,
          take: limit + 1, // Take one more to check if there are more items
          ...(cursor
            ? {
                cursor: {
                  id: cursor,
                },
                skip: 1, // Skip the cursor
              }
            : {}),
          orderBy: {
            [sort]: "desc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            location: true,
            venue: true,
            date: true,
            start_time: true,
            end_time: true,
            image_url: true,
            is_featured: true,
            is_free: true,
            price: true,
            attendee_count: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            organizer: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                attendees: true,
              },
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (events.length > limit) {
          const nextItem = events.pop(); // Remove the extra item
          nextCursor = nextItem!.id; // Set the cursor to the last item's id
        }

        const [total] = await prisma.$transaction([
          prisma.event.count({ where }),
        ]);

        return {
          events,
          nextCursor,
          total,
        };
      },
      { events: [], total: 0, nextCursor: undefined }
    );

    return result.data;
  }
);

export const getEventBySlug = cache(async (slug: string) => {
  const result = await withErrorHandling(async () => {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        location: true,
        venue: true,
        date: true,
        start_time: true,
        end_time: true,
        image_url: true,
        is_featured: true,
        is_free: true,
        price: true,
        attendee_count: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attendees: {
          take: 5,
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  }, null);

  return result;
});

export async function createEvent(data: {
  name: string;
  description: string;
  location: string;
  venue: string;
  startDateTime: string;
  endDateTime: string;
  categoryId: string;
  isFree: boolean;
  price?: number;
  maxAttendees?: number;
  status: "draft" | "published";
  imageUrl?: string;
}) {
  const result = await withErrorHandling<EventActionResult>(
    async () => {
      const event = await prisma.event.create({
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          venue: data.venue,
          slug: slugify(data.name),
          date: new Date(data.startDateTime),
          start_time: format(new Date(data.startDateTime), "HH:mm"),
          end_time: format(new Date(data.endDateTime), "HH:mm"),
          is_free: data.isFree,
          price: data.price,
          max_attendees: data.maxAttendees,
          image_url: data.imageUrl,
          category: {
            connect: { id: data.categoryId },
          },
        },
        include: {
          category: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });

      return { success: true, event };
    },
    { success: false, event: null, error: "Failed to create event" }
  );

  return result.data;
}

export async function registerForEvent(eventId: string, userId: string) {
  const result = await withErrorHandling<EventActionResult>(
    async () => {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            connect: { id: userId },
          },
          attendee_count: {
            increment: 1,
          },
        },
        include: {
          attendees: true,
        },
      });
      return { success: true as const, event };
    },
    {
      success: false as const,
      event: null,
      error: "Failed to register for event",
    }
  );

  return result.data;
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const result = await withErrorHandling<EventActionResult>(
    async () => {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          attendees: {
            disconnect: { id: userId },
          },
          attendee_count: {
            decrement: 1,
          },
        },
        include: {
          attendees: true,
        },
      });
      return { success: true as const, event };
    },
    {
      success: false as const,
      event: null,
      error: "Failed to unregister from event",
    }
  );

  return result.data;
}
