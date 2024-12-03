"use client";

import * as React from "react";
import { HeroSlider } from "./hero-slider";
import { SearchBar } from "./search-bar";
import { CategoryTags } from "./category-tags";
import { EventCard } from "./events/event-card";
import { FilterState } from "@/types/filters";
import { getEvents } from "@/lib/actions/event";
import type { Event } from "@/types/event";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

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
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category");
  const searchTerm = searchParams.get("search") || "";

  const fetchEvents = useCallback(
    async (params: { category?: string; query?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getEvents({
          category: params.category,
          query: params.query,
        });
        if (result?.events) {
          setEvents(result.events as Event[]);
        } else {
          setError("Failed to load events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchEvents({ category: categoryId || undefined, query: searchTerm });
  }, [categoryId, searchTerm, fetchEvents]);

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleFilterChange = useCallback((filters: FilterState) => {
    // TODO: Implement filter logic
    console.log("Filters changed:", filters);
  }, []);

  const handleCategorySelect = useCallback(
    (category?: string) => {
      const params = new URLSearchParams(searchParams);
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-muted py-10 md:py-14" aria-label="Featured Events">
        <div className="container space-y-10">
          <HeroSlider events={initialFeaturedEvents} />
          <div className="space-y-4">
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
            <nav aria-label="Categories">
              <CategoryTags
                categories={initialCategories}
                selectedCategory={categoryId || undefined}
                onSelectCategory={handleCategorySelect}
              />
            </nav>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-10" aria-label="Event Listings">
        <div className="container">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
