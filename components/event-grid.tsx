"use client";

import * as React from "react";
import { EventCard } from "./events/event-card";
import { SearchBar } from "./search-bar";
import { CategoryTags } from "./category-tags";
import type { Event } from "@/types/event";
import type { Category } from "@/types/category";
import type { FilterState } from "@/types/filters";

interface EventGridProps {
  events: Event[];
  categories: Category[];
  selectedCategory?: string;
  onSearch: (term: string) => void;
  onCategorySelect: (category?: string) => void;
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export function EventGrid({
  events,
  categories,
  selectedCategory,
  onSearch,
  onCategorySelect,
  onFilterChange,
  isLoading,
}: EventGridProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SearchBar
          onSearch={onSearch}
          onFilterChange={onFilterChange}
          isLoading={isLoading}
        />
        <CategoryTags
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onCategorySelect}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
