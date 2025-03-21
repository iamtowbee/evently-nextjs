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
import { Loader2 } from "lucide-react";
import { HeroSlider } from "@/components/(home)/hero-slider";
import type { Event } from "@/types/event";

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
  const { filters } = useEventFilters();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["events", filters],
    queryFn: async ({ pageParam = undefined }) => {
      const result = await getEvents({
        query: filters.searchTerm,
        category: filters.category,
        location: filters.location,
        minPrice: filters.onlyFreeEvents ? 0 : filters.priceRange[0],
        maxPrice: filters.onlyFreeEvents ? 0 : filters.priceRange[1],
        onlyFreeEvents: filters.onlyFreeEvents,
        date: filters.date,
        sort: filters.sortBy,
        cursor: pageParam,
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
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData:
      filters.searchTerm === "" && filters.category === ""
        ? {
            pages: [
              {
                events: initialEvents,
                nextCursor: undefined,
                total: initialEvents.length,
              },
            ],
            pageParams: [undefined],
          }
        : undefined,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const events = React.useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.events);
  }, [data?.pages]);

  const selectedCategory = React.useMemo(() => {
    return initialCategories.find((cat) => cat.slug === filters.category);
  }, [initialCategories, filters.category]);

  return (
    <div className="space-y-8">
      <HeroSlider
        events={initialFeaturedEvents}
        isLoading={isLoading && !events.length}
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

          {isLoading && !events.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading events. Please try again later.
            </div>
          ) : events.length === 0 ? (
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
            <EventList events={events} />
          )}

          {(hasNextPage || isFetchingNextPage) && (
            <div ref={ref} className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
