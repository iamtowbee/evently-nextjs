"use client";

import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { FilterState } from "@/types/filters";
import { EventCard } from "@/components/event-card";

interface EventGridProps {
  initialEvents: Event[];
}

export function EventGrid({ initialEvents }: EventGridProps) {
  const [events] = useState<Event[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...events];

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        return (
          (!fromDate || eventDate >= fromDate) &&
          (!toDate || eventDate <= toDate)
        );
      });
    }

    // Category filter
    if (filters.eventType && filters.eventType !== "All Events") {
      filtered = filtered.filter(
        (event) =>
          event.category.toLowerCase() === filters.eventType?.toLowerCase()
      );
    }

    // Price filters
    if (filters.onlyFreeEvents) {
      filtered = filtered.filter((event) => event.isFree);
    }

    if (filters.priceRange) {
      filtered = filtered.filter((event) => {
        if (event.isFree) return false;
        const price = event.price || 0;
        return (
          price >= filters.priceRange![0] && price <= filters.priceRange![1]
        );
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((event) =>
        event.location
          .toLowerCase()
          .includes(filters.location?.toLowerCase() || "")
      );
    }

    setFilteredEvents(filtered);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No events found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
