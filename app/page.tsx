import { Suspense } from "react";
import { HomeContent } from "@/components/home-content";
import { getEvents } from "@/lib/actions/event";
import { getCategories } from "@/lib/actions/category";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [events, featured, categories] = await Promise.all([
    getEvents({ limit: 10 }),
    getEvents({ featured: true, limit: 3 }),
    getCategories(),
  ]);

  return (
    <main className="flex-1">
      <Suspense fallback={<div>Loading content...</div>}>
        <HomeContent
          initialEvents={events?.events || []}
          initialFeaturedEvents={featured?.events || []}
          initialCategories={categories?.categories || []}
        />
      </Suspense>
    </main>
  );
}
