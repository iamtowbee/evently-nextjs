import Image from "next/image";
import { Event } from "@prisma/client";
import { EventCard } from "@/components/(events)/event-card";
import { Skeleton } from "@/components/ui/skeleton";

function EventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background transition-colors hover:bg-accent/50">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export type ExtendedEvent = Event & {
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    attendees: number;
  };
  tags?: string[];
};

interface EventListProps {
  events: ExtendedEvent[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?:
    | React.RefObject<HTMLDivElement>
    | ((node?: Element | null) => void);
}

export function EventList({
  events,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  loadMoreRef,
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Image
          src="/assets/images/no-events.svg"
          alt="No events found"
          width={300}
          height={300}
          className="mb-8"
        />
        <h3 className="text-2xl font-bold text-gray-900">No events found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {loadMoreRef && (
        <div
          ref={loadMoreRef as any}
          className="w-full flex justify-center py-4"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading more events...</span>
            </div>
          )}

          {hasNextPage === false &&
            events.length > 0 &&
            !isFetchingNextPage && (
              <p className="text-muted-foreground text-sm">
                No more events to load
              </p>
            )}
        </div>
      )}
    </div>
  );
}
