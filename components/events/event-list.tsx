import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "./event-card";
import type { Event } from "@/types/event";

interface EventListProps {
  events: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function EventList({
  events,
  total,
  totalPages,
  currentPage,
}: EventListProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("page", String(currentPage - 1));
              window.location.search = searchParams.toString();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("page", String(currentPage + 1));
              window.location.search = searchParams.toString();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
