"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { Event, EventActionResult } from "@/types/event";
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
  date?: Date;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyFreeEvents?: boolean;
};

export const getEvents = cache(
  async ({
    query,
    category,
    limit = 6,
    cursor,
    sort = "date",
    featured = false,
    date,
    location,
    minPrice,
    maxPrice,
    onlyFreeEvents,
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

    if (date) {
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (location) {
      where.OR = [
        ...(where.OR || []),
        { location: { contains: location, mode: "insensitive" } },
        { venue: { contains: location, mode: "insensitive" } },
      ];
    }

    if (onlyFreeEvents) {
      where.is_free = true;
    } else if (minPrice !== undefined || maxPrice !== undefined) {
      where.AND = {
        AND: [
          {
            OR: [
              { is_free: false },
              {
                AND: [
                  { price: { gte: minPrice } },
                  { price: { lte: maxPrice } },
                ],
              },
            ],
          },
        ],
      };
    }

    const result = await withErrorHandling(
      async () => {
        // First, get total count
        const total = await prisma.event.count({ where });

        // If there are no events or cursor is beyond total, return empty result
        if (
          total === 0 ||
          (cursor &&
            !(await prisma.event.findUnique({ where: { id: cursor } })))
        ) {
          return {
            events: [],
            nextCursor: undefined,
            total: 0,
          };
        }

        // Fetch events with pagination
        const events = await prisma.event.findMany({
          where,
          take: limit + 1,
          ...(cursor
            ? {
                cursor: {
                  id: cursor,
                },
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

        // Only set nextCursor if we have more items
        if (events.length > limit) {
          const nextItem = events.pop(); // Remove the extra item
          nextCursor = nextItem!.id;
        }

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
  try {
    const event = await prisma.event.findFirst({
      where: { slug },
      include: {
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

    return { data: event, error: null };
  } catch (error) {
    // Check if it's a connection error
    if (
      error instanceof Error &&
      (error.message.includes("connect") ||
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      return {
        data: null,
        error:
          "Connection error: Please check your internet connection and try again.",
      };
    }
    return {
      data: null,
      error: "Failed to load event details. Please try again.",
    };
  }
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

export const getSimilarEvents = cache(async (eventId: string, limit = 3) => {
  const result = await withErrorHandling(async () => {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { category_id: true },
      });

      if (!event) return [];

      const similarEvents = await prisma.event.findMany({
        where: {
          category_id: event.category_id,
          id: { not: eventId },
        },
        take: limit,
        include: {
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

      return similarEvents;
    } catch (error) {
      // Check if it's a connection error
      if (
        error instanceof Error &&
        (error.message.includes("connect") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED"))
      ) {
        throw new Error(
          "Connection error: Please check your internet connection and try again."
        );
      }
      throw error;
    }
  }, []);

  return result.data;
});
