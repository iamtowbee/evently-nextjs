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
import { Loader2 } from "lucide-react";

interface HomeContentProps {
  initialEvents: Event[];
  initialFeaturedEvents: Event[];
  initialCategories: Category[];
}

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
    threshold: 0.5,
    delay: 100, // Add a small delay to prevent rapid firing
  });

  const fetchEvents = useCallback(
    async ({ pageParam = undefined }) => {
      const result = await getEvents({
        query: filters.searchTerm,
        category: filters.category,
        cursor: pageParam,
        limit: 6,
      });

      if (!result) {
        return {
          events: [],
          nextCursor: undefined,
          total: 0,
        };
      }

      return result;
    },
    [filters.searchTerm, filters.category]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["events", filters.searchTerm, filters.category],
      queryFn: fetchEvents,
      initialData: {
        pages: [
          {
            events: initialEvents,
            nextCursor: undefined,
            total: initialEvents.length,
          },
        ],
        pageParams: [undefined],
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allEvents = data?.pages.flatMap((page) => page.events) ?? [];

  const handleSearch = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {status === "loading" ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : status === "error" ? (
              <div className="col-span-full text-center py-8 text-destructive">
                Error loading events
              </div>
            ) : (
              <>
                {allEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                <div
                  ref={ref}
                  className="col-span-full flex justify-center py-8"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : hasNextPage ? (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      Load More
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
