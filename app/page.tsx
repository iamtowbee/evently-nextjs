"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { Navbar } from "@/components/navbar";
import type { Event, FilterState } from "@/types/events";

// Import our dummy events data
import eventsData from "@/events.json";

export default function Component() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [filteredEvents, setFilteredEvents] = React.useState<Event[]>(
    eventsData.events
  );
  const [filters, setFilters] = React.useState<FilterState>({
    searchTerm: "",
    category: "All",
    date: undefined,
    location: "",
    priceRange: [0, 1000],
    onlyFreeEvents: false,
  });

  // Featured events for the hero slider (first 5 events)
  const featuredEvents = eventsData.events.slice(0, 5);

  // Get unique categories from events
  const categories = Array.from(
    new Set(eventsData.events.map((event) => event.category))
  );

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, searchTerm }));
    filterEvents({ ...filters, searchTerm });
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    filterEvents(updatedFilters);
  };

  const filterEvents = (currentFilters: FilterState) => {
    let filtered = eventsData.events;

    // Search term filter
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (currentFilters.category && currentFilters.category !== "All") {
      filtered = filtered.filter(
        (event) => event.category === currentFilters.category
      );
    }

    // Date filter
    if (currentFilters.date) {
      const filterDate = currentFilters.date.toISOString().split("T")[0];
      filtered = filtered.filter((event) => event.date === filterDate);
    }

    // Location filter
    if (currentFilters.location) {
      const locationLower = currentFilters.location.toLowerCase();
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(locationLower)
      );
    }

    // Price range filter
    if (currentFilters.priceRange) {
      filtered = filtered.filter((event) => {
        const price = event.price || 0;
        return (
          price >= currentFilters.priceRange[0] &&
          price <= currentFilters.priceRange[1]
        );
      });
    }

    // Free events filter
    if (currentFilters.onlyFreeEvents) {
      filtered = filtered.filter((event) => !event.price || event.price === 0);
    }
    setFilteredEvents(filtered);
  };

  // Auto advance slider
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar categories={categories} />

      <main className="flex-1">
        {/* Hero Slider */}
        <section className="relative h-[500px] overflow-hidden">
          {featuredEvents.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                index === currentSlide ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={event.image}
                alt={event.name}
                className="object-cover"
                fill
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="inline-block px-2 py-1 mb-2 text-sm bg-primary rounded">
                  {event.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {event.name}
                </h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentSlide ? "bg-white" : "bg-white/50"
                )}
                onClick={() => setCurrentSlide(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Find Your Next Event
          </h2>
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
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
