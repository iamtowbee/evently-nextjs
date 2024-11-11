"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarDays, MapPin, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { HeroSlider } from "@/components/hero-slider";

// Import our dummy events data
import eventsData from "@/events.json";
import Navbar from "@/components/navbar";

export default function Component() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");

  // Featured events for the hero slider (first 5 events)
  const featuredEvents = eventsData.events.slice(0, 5);

  // Filter events based on search term and category
  const filteredEvents = eventsData.events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from events
  const categories = Array.from(
    new Set(eventsData.events.map((event) => event.category))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider events={featuredEvents} />

        {/* Search Section */}
        <section className="py-12 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Find Your Next Event
          </h2>
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Event Grid */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-card rounded-lg overflow-hidden border"
              >
                <div className="aspect-video relative">
                  <Image
                    src={event.image}
                    alt={event.name}
                    className="object-cover transition-transform group-hover:scale-105"
                    fill
                  />
                  <button className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background">
                    <Heart className="w-5 h-5" />
                    <span className="sr-only">Add to favorites</span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {event.category}
                    </span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
