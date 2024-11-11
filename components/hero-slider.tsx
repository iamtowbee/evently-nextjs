"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Event = {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  image: string;
};

export function HeroSlider({ events }: { events: Event[] }) {
  return (
    <Carousel className="relative h-[500px] w-full">
      <CarouselContent>
        {events.map((event) => (
          <CarouselItem key={event.id}>
            <div className="relative h-[500px] w-full overflow-hidden">
              <Image
                src={event.image}
                alt={event.name}
                className="object-cover"
                fill
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="inline-block px-2 py-1 mb-2 text-sm bg-primary rounded">
                  {event.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {event.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <span className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </span>
                </div>
                <Button>View Event</Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}
