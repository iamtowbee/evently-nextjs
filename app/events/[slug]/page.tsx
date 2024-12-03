import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventBySlug } from "@/lib/actions/event";
import { getImageUrl } from "@/lib/utils";

interface EventPageProps {
  params: {
    slug: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await Promise.resolve(params);
  const result = await getEventBySlug(slug);

  if (!result?.data) {
    notFound();
  }

  const event = result.data;

  const imageUrl = getImageUrl(event.image_url);

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

            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={new Date(event.date).toISOString()}>
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {event.start_time} - {event.end_time}
                </span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                  {event.location && (
                    <span className="text-muted-foreground">
                      ({event.location})
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {event.attendee_count} attending
                  {event.max_attendees && ` / ${event.max_attendees} spots`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {event.is_free ? (
                  <span className="text-green-600 dark:text-green-400">
                    Free
                  </span>
                ) : (
                  <span>${event.price?.toFixed(2)}</span>
                )}
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  Register Now
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {event.description && (
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold">About this event</h2>
                <div className="prose max-w-none dark:prose-invert">
                  {event.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
