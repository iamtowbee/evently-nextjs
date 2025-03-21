"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import { getImageUrl } from "@/lib/utils";
import type { Event } from "@/types/event";

interface HeroSliderProps {
  events: Event[];
  isLoading?: boolean;
}

export function HeroSlider({ events, isLoading = false }: HeroSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <section className="bg-muted/30">
        <div className="container py-8">
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3].map((index) => (
                <CarouselItem key={index}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <div className="flex flex-wrap gap-4">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-10 w-28" />
                      </div>
                    </div>

                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>
    );
  }

  if (!events.length) return null;

  return (
    <section className="bg-muted/30">
      <div className="container py-8">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {events.map((event) => (
              <CarouselItem key={event.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-3xl md:text-4xl font-heading font-semibold">
                        {event.name}
                      </h2>
                      <p className="text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm">{event.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                          <span>
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          <span>
                            {event.start_time} - {event.end_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-semibold">
                        {event.is_free ? (
                          <span className="text-success">Free</span>
                        ) : (
                          <span>${event.price}</span>
                        )}
                      </div>
                      <Button asChild>
                        <Link href={`/events/${event.slug}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={getImageUrl(event.image_url)}
                      alt={event.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
