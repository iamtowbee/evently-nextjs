import Image from "next/image";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/types/event";
import { cn, getImageUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const imageUrl = getImageUrl(event.image_url);

  return (
    <Card
      className={cn(
        "overflow-hidden",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "hover:border-primary/20"
      )}
    >
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <h3 className="text-xl font-heading font-semibold mb-3">
          {event.name}
        </h3>

        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm mt-0.5">{event.location}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-primary" />
            <span className="mt-0.5">
              {format(new Date(event.date), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span className="mt-0.5">
              {event.start_time} - {event.end_time}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              {event.category?.name || "Uncategorized"}
            </span>
          </div>
          <div className="text-right">
            {event.is_free ? (
              <span className="text-success font-medium">Free</span>
            ) : (
              <span className="text-lg font-semibold">${event.price}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
