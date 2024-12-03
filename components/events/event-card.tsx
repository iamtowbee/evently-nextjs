import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn, getImageUrl } from "@/lib/utils";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const imageUrl = getImageUrl(event.image_url);

  return (
    <Card
      className={cn(
        "group h-full flex flex-col overflow-hidden transition-colors hover:border-primary/20",
        className
      )}
    >
      <CardHeader className="p-0">
        <Link
          href={`/events/${event.slug}`}
          className="relative block aspect-[4/3]"
        >
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {event.is_featured && (
            <Badge
              variant="secondary"
              className="absolute right-4 top-4 bg-white/90 dark:bg-gray-950/90 text-primary hover:text-primary-foreground"
            >
              Featured
            </Badge>
          )}
        </Link>
      </CardHeader>
      <CardContent className="flex-1 grid gap-2.5 p-4">
        <div className="space-y-2">
          <Link
            href={`/events/${event.slug}`}
            className="inline-block hover:underline hover:text-primary transition-colors"
          >
            <h3 className="text-base font-semibold line-clamp-2">
              {event.name}
            </h3>
          </Link>
          <div className="text-sm font-medium">
            {event.is_free ? (
              <span className="text-green-600 dark:text-green-400">Free</span>
            ) : (
              <span>${event.price?.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="grid gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <time dateTime={event.date.toISOString()} className="line-clamp-1">
              {format(event.date, "EEE, MMM d, yyyy")}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {event.start_time} - {event.end_time}
            </span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          {event.category && (
            <Link href={`/categories/${event.category.slug}`}>
              <Badge
                variant="outline"
                className="w-fit hover:bg-primary/10 hover:border hover:border-primary/80"
              >
                {event.category.name}
              </Badge>
            </Link>
          )}
          <div className="text-sm text-muted-foreground">
            {event._count?.attendees || 0} attending
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
