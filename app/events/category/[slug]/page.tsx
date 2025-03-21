import { Suspense } from "react";
import { getEvents } from "@/lib/actions/event";
import { getCategories } from "@/lib/actions/category";
import { EventCard } from "@/components/(events)/event-card";
import { CategoryFiltersWrapper } from "@/components/(browse)/category-filters-wrapper";
import { notFound } from "next/navigation";
import type { Event } from "@/types/event";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    date?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategories();
  if (!data?.categories)
    return {
      title: "Category Not Found | Meetly",
      description: "The requested category could not be found.",
    };

  const category = data.categories.find((c) => c.slug === slug);
  if (!category)
    return {
      title: "Category Not Found | Meetly",
      description: "The requested category could not be found.",
    };

  return {
    title: `${category.name} Events | Meetly`,
    description:
      category.description || `Browse ${category.name} events on Meetly`,
  };
}

export default async function CategoryEventsPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const {
    q = "",
    date,
    location,
    minPrice,
    maxPrice,
    sort = "date",
  } = await searchParams;

  // Get category details and all categories for filtering
  const data = await getCategories();
  if (!data?.categories) notFound();

  const category = data.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  // Fetch events for this category
  const result = await getEvents({
    category: slug,
    query: q,
    date: date ? new Date(date) : undefined,
    location,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  });

  const events = result?.events || [];

  return (
    <main className="flex-1">
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-heading">
                {category.name} Events
              </h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <CategoryFiltersWrapper />

          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[400px] rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    No {category.name.toLowerCase()} events found
                  </p>
                </div>
              ) : (
                events.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </main>
  );
}
