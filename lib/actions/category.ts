"use server";

import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/utils";
import { slugify } from "@/lib/utils";

export async function createCategory(name: string, description?: string) {
  const slug = slugify(name);

  const result = await withErrorHandling(
    async () => {
      const category = await prisma.category.create({
        data: {
          id: slug, // Use the slug as the ID
          name,
          slug,
          description,
        },
      });
      return { category };
    },
    {
      category: {
        id: "",
        name: "",
        description: null,
        slug: "",
        createdAt: new Date(),
      },
    }
  );

  return result.data;
}

export async function getCategories(options?: {
  includeEventCount?: boolean;
  includeImage?: boolean;
}) {
  const result = await withErrorHandling(
    async () => {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
        include: options?.includeEventCount
          ? {
              _count: {
                select: {
                  events: true,
                },
              },
            }
          : undefined,
      });

      return {
        categories: categories.map((category) => ({
          ...category,
          card_image_url: options?.includeImage
            ? `/images/categories/${category.slug}.jpg`
            : undefined,
        })),
      };
    },
    { categories: [] }
  );

  return result.data;
}

export async function getTopCategories(limit = 5) {
  const result = await withErrorHandling(
    async () => {
      const categories = await prisma.$queryRaw<
        Array<{ id: string; name: string; slug: string }>
      >`
        SELECT c.*, COUNT(e.id) as event_count
        FROM public.categories c
        LEFT JOIN public.events e ON c.id = e.category_id
        GROUP BY c.id
        ORDER BY event_count DESC
        LIMIT ${limit}
      `;
      return { categories };
    },
    { categories: [] }
  );

  return result.data;
}
