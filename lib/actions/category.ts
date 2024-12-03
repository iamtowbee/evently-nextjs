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
    { category: null }
  );

  return result.data;
}

export async function getCategories() {
  const result = await withErrorHandling(
    async () => {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      });
      return { categories };
    },
    { categories: [] }
  );

  return result.data;
}

export async function getTopCategories(limit = 5) {
  const result = await withErrorHandling(
    async () => {
      const categories = await prisma.$queryRaw`
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
