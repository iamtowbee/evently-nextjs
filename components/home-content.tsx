"use client";

import * as React from "react";
import { HeroSlider } from "./hero-slider";
import { SearchBar } from "./search-bar";
import { CategoryTags } from "./category-tags";
import { EventCard } from "./events/event-card";
import { FilterState } from "@/types/filters";
import { getEvents } from "@/lib/actions/event";
import type { Event } from "@/types/event";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useCallback } from "react";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

interface HomeContentProps {
  initialEvents: Event[];
  initialFeaturedEvents: Event[];
  initialCategories: Category[];
}

type EventQueryResponse = {
  events: Event[];
  nextCursor?: string;
  total: number;
};

export function HomeContent({
  initialEvents,
  initialFeaturedEvents,
  initialCategories,
}: HomeContentProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    searchTerm: "",
    category: "",
    location: "",
    priceRange: [0, 1000],
    onlyFreeEvents: false,
    date: undefined,
  });

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchEvents = useCallback(
    async ({ pageParam }: { pageParam: string | null }) => {
      try {
        const result = await getEvents({
          query: filters.searchTerm,
          category: filters.category,
          cursor: pageParam ?? undefined,
          limit: 6,
          date: filters.date,
          location: filters.location,
          minPrice: filters.onlyFreeEvents ? undefined : filters.priceRange[0],
          maxPrice: filters.onlyFreeEvents ? undefined : filters.priceRange[1],
          onlyFreeEvents: filters.onlyFreeEvents,
        });

        if (!result) {
          throw new Error("Failed to fetch events");
        }

        return {
          events: result.events,
          nextCursor: result.nextCursor,
          total: result.total,
        } as EventQueryResponse;
      } catch (error) {
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
    },
    [
      filters.searchTerm,
      filters.category,
      filters.date,
      filters.location,
      filters.priceRange,
      filters.onlyFreeEvents,
    ]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["events", filters.searchTerm, filters.category],
    queryFn: fetchEvents,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursor || lastPage.events.length === 0) return null;
      return lastPage.nextCursor;
    },
    initialData:
      filters.searchTerm === "" && filters.category === ""
        ? {
            pages: [
              {
                events: initialEvents.map((event) => ({
                  ...event,
                  category: event.category || null,
                  _count: {
                    attendees: event.attendee_count,
                  },
                })),
                nextCursor: undefined,
                total: initialEvents.length,
              },
            ],
            pageParams: [null],
          }
        : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allEvents = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.events) ?? [];
  }, [data?.pages]);

  const handleSearch = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string | undefined) => {
      // If no category is selected, reset the filter
      if (!categoryId) {
        setFilters((prev) => ({ ...prev, category: "" }));
        return;
      }

      // Find the category by ID and use its slug for filtering
      const category = initialCategories.find((cat) => cat.id === categoryId);
      setFilters((prev) => ({ ...prev, category: category?.slug ?? "" }));
    },
    [initialCategories]
  );

  return (
    <div className="space-y-8">
      {initialFeaturedEvents.length > 0 && (
        <HeroSlider events={initialFeaturedEvents} />
      )}

      <div className="container">
        <div className="space-y-8">
          <SearchBar onSearch={handleSearch} onFilterChange={setFilters} />

          <CategoryTags
            categories={initialCategories}
            selectedCategory={filters.category}
            onSelectCategory={handleCategorySelect}
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
          ) : isLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    ...event,
                    category: event.category || null,
                    _count: {
                      attendees: event.attendee_count,
                    },
                  }}
                />
              ))}
              {(hasNextPage || isFetchingNextPage) && (
                <div
                  ref={ref}
                  className="col-span-full flex justify-center py-8"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
