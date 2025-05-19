import { Suspense } from "react";
import { HomeContent } from "@/components/(home)/home-content";
import { getEvents } from "@/lib/actions/event";
import { getCategories } from "@/lib/actions/category";
import { ExtendedEvent } from "@/components/event-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categories = await getCategories();
  const events = await getEvents({ limit: 24 }); // Get more events initially to test cursor
  const featuredEvents = await getEvents({ featured: true, limit: 3 });

  // Debug logs for the events we're getting
  console.log(
    `[Home Page] Initial events count: ${events?.events?.length || 0}`
  );
  console.log(
    `[Home Page] Has nextCursor: ${Boolean(events?.nextCursor)}, value: ${
      events?.nextCursor
    }`
  );

  // If we have events, log the first and last event ID for debugging
  if (events?.events?.length) {
    console.log(`[Home Page] First event ID: ${events.events[0].id}`);
    console.log(
      `[Home Page] Last event ID: ${events.events[events.events.length - 1].id}`
    );
  }

  console.log(
    `[Home Page] Featured events count: ${featuredEvents?.events?.length || 0}`
  );

  return (
    <main className="flex-1">
      <Suspense fallback={<div>Loading content...</div>}>
        <HomeContent
          initialEvents={(events?.events || []) as unknown as ExtendedEvent[]}
          initialFeaturedEvents={
            (featuredEvents?.events || []) as unknown as ExtendedEvent[]
          }
          initialCategories={categories?.categories || []}
        />
      </Suspense>
    </main>
  );
}