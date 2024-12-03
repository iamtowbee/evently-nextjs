"use server";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { Event } from "@/types/event";
import { slugify, withErrorHandling } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export type GetEventsParams = {
  query?: string;
  category?: string;
  limit?: number;
  page?: number;
  sort?: string;
};

export async function getEvents({
  query,
  category,
  limit = 6,
  page = 1,
  sort = "date",
}: GetEventsParams = {}) {
  const skip = (page - 1) * limit;

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

  const result = await withErrorHandling(
    async () => {
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          take: limit,
          skip,
          orderBy: {
            [sort]: "desc",
          },
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
        }),
        prisma.event.count({ where }),
      ]);

      return {
        events,
        total,
        pages: Math.ceil(total / limit),
      };
    },
    { events: [], total: 0, pages: 0 }
  );

  return result.data;
}

export async function getEventBySlug(slug: string) {
  const result = await withErrorHandling(async () => {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attendees: {
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
}

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
  const result = await withErrorHandling(
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

      return { success: true as const, event };
    },
    { success: false as const, error: "Failed to create event" }
  );

  return result.data;
}

export async function registerForEvent(eventId: string, userId: string) {
  const result = await withErrorHandling(
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
      return { success: true, event };
    },
    { success: false, error: "Failed to register for event" }
  );

  return result.data;
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const result = await withErrorHandling(
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
      return { success: true, event };
    },
    { success: false, error: "Failed to unregister from event" }
  );

  return result.data;
}
