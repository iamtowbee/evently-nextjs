import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Users, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventBySlug, getSimilarEvents } from "@/lib/actions/event";
import { getImageUrl } from "@/lib/utils";
import { EventCard } from "@/components/events/event-card";
import type { Event } from "@/types/event";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const result = await getEventBySlug(slug);

  // Handle connection errors or failed requests
  if (!result || result.error) {
    return (
      <main className="flex-1">
        <div className="container max-w-3xl py-20">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative h-24 w-24 text-muted-foreground">
              <Image
                src="/calendar-404.svg"
                alt="404 illustration"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Unable to Load Event</h1>
              <p className="text-lg text-muted-foreground">
                {result?.error?.includes("Connection error")
                  ? "Please check your internet connection and try again."
                  : "We're having trouble loading this event. Please try again."}
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
            <div className="pt-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!result.data) {
    notFound();
  }

  const event = result.data;
  const imageUrl = getImageUrl(event.image_url);

  // Fetch similar events with error handling
  let similarEvents: Event[] = [];
  try {
    const similarEventsResult = await getSimilarEvents(event.id, 3);
    if (similarEventsResult) {
      similarEvents = similarEventsResult;
    }
  } catch (error) {
    console.error("Failed to fetch similar events:", error);
  }

  return (
    <main className="flex-1">
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Event Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            {event.is_featured && (
              <Badge
                variant="secondary"
                className="absolute right-4 top-4 bg-white/90 dark:bg-gray-950/90"
              >
                Featured
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              {event.category && (
                <Link href={`/categories/${event.category.slug}`}>
                  <Badge
                    variant="outline"
                    className="w-fit hover:bg-primary/10"
                  >
                    {event.category.name}
                  </Badge>
                </Link>
              )}
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Organized by</span>
                <span className="font-medium text-foreground">
                  {event.organizer?.name || "Anonymous"}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{format(event.date, "EEEE, MMMM d, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {event.start_time} - {event.end_time}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  {event.attendee_count} attending
                  {event.max_attendees && ` / ${event.max_attendees} spots`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-semibold">
                {event.is_free ? (
                  <span className="text-success">Free</span>
                ) : (
                  <span>${event.price}</span>
                )}
              </div>
              <Button size="lg" className="w-full">
                Register Now
              </Button>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">About this event</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {event.description}
          </div>
        </div>

        {/* Similar Events Section */}
        {similarEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">
              Similar Events You Might Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarEvents.map((similarEvent) => (
                <EventCard key={similarEvent.id} event={similarEvent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
