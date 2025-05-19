"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/(browse)/search-bar";
import { CategoryTags } from "@/components/(categories)/category-tags";
import { EventList } from "@/components/(events)/event-list";
import { getEvents } from "@/lib/actions/event";
import { Category } from "@prisma/client";
import { useEventFilters } from "@/hooks/use-event-filters";
import { Loader2, RefreshCcw } from "lucide-react";
import { HeroSlider } from "@/components/(home)/hero-slider";
import type { Event } from "@/types/event";
import { Button } from "@/components/ui/button";

interface HomeContentProps {
  initialEvents: Event[];
  initialFeaturedEvents: Event[];
  initialCategories: Category[];
}

type QueryResult = {
  items: Event[];
  nextPage: string | undefined;
};

export function HomeContent({
  initialEvents,
  initialFeaturedEvents,
  initialCategories,
}: HomeContentProps) {
  const { filters } = useEventFilters();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<QueryResult>({
    queryKey: ["events", filters],
    queryFn: async ({ pageParam }) => {
      console.log(`[HomeContent] Fetching page with cursor: ${pageParam}`);
      const result = await getEvents({
        query: filters.searchTerm,
        category: filters.category,
        cursor: pageParam as string | undefined,
        limit: 12,
        date: filters.date,
        location: filters.location,
        minPrice: filters.onlyFreeEvents ? undefined : filters.priceRange[0],
        maxPrice: filters.onlyFreeEvents ? undefined : filters.priceRange[1],
        onlyFreeEvents: filters.onlyFreeEvents,
        sort: filters.sortBy,
      });

      if (!result) throw new Error("Failed to fetch events");

      console.log(
        `[HomeContent] Received ${result.events.length} events with nextCursor: ${result.nextCursor}`
      );

      return {
        items: result.events,
        nextPage: result.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => {
      console.log(`[HomeContent] Getting next page param from: `, lastPage);
      // Only return undefined if nextPage is explicitly undefined (not null, empty string, etc)
      return lastPage.nextPage === undefined ? undefined : lastPage.nextPage;
    },
    initialPageParam: undefined as string | undefined,
    initialData: {
      pages: [
        {
          items: initialEvents,
          nextPage:
            initialEvents.length >= 12
              ? initialEvents.length === 12 && initialEvents.length % 12 === 0
                ? // If we have exactly 12 items, check if we need a cursor for the final item
                  initialEvents[initialEvents.length - 1].id
                : // Otherwise use the standard approach
                  initialEvents[initialEvents.length - 1].id
              : undefined,
        },
      ],
      pageParams: [undefined],
    },
  });

  const allEvents = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const selectedCategory = React.useMemo(() => {
    return initialCategories.find((cat) => cat.slug === filters.category);
  }, [initialCategories, filters.category]);

  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: "300px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-8">
      <HeroSlider
        events={initialFeaturedEvents}
        isLoading={isLoading && !allEvents.length}
      />

      <div className="container">
        <div className="space-y-8 my-6">
          <SearchBar />

          <CategoryTags
            categories={initialCategories}
            selectedCategory={filters.category}
            onSelectCategory={(slug) => {
              useEventFilters.getState().setFilter("category", slug ?? "");
            }}
          />

          {isError ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <p className="text-lg text-destructive">
                {error instanceof Error &&
                error.message.includes("Connection error")
                  ? error.message
                  : "Failed to load events"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : isLoading && !allEvents.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filters.searchTerm
                ? `No events found for "${filters.searchTerm}"`
                : filters.category
                ? `No events found in ${
                    selectedCategory?.name ?? "this category"
                  }`
                : "No events found"}
            </div>
          ) : (
            <div className="space-y-8">
              <EventList events={allEvents} />
              <div
                ref={loadMoreRef}
                className="w-full flex justify-center py-4"
              >
                {isFetchingNextPage && (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
