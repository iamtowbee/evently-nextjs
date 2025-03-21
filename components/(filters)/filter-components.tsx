"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEventFilters } from "@/hooks/use-event-filters";

export function SortByFilter() {
  const { filters, setFilter } = useEventFilters();

  return (
    <FormItem>
      <FormLabel>Sort By</FormLabel>
      <Select
        value={filters.sortBy}
        onValueChange={(value) => setFilter("sortBy", value)}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="newest">Date: Newest First</SelectItem>
          <SelectItem value="oldest">Date: Oldest First</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  );
}

export function DateFilter() {
  const { filters, setFilter } = useEventFilters();

  return (
    <FormItem>
      <FormLabel>Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !filters.date && "text-muted-foreground"
              )}
            >
              {filters.date ? (
                format(filters.date, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.date}
            onSelect={(date) => {
              setFilter("date", date);
              // Close popover after selection
              const button = document.querySelector(
                '[data-state="open"]'
              ) as HTMLButtonElement;
              button?.click();
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}

export function LocationFilter() {
  const { filters, setFilter } = useEventFilters();

  return (
    <FormItem>
      <FormLabel>Location</FormLabel>
      <FormControl>
        <Input
          placeholder="Enter location..."
          value={filters.location}
          onChange={(e) => setFilter("location", e.target.value)}
        />
      </FormControl>
    </FormItem>
  );
}

export function PriceFilter() {
  const { filters, setFilter } = useEventFilters();

  return (
    <>
      <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <FormLabel className="font-normal">Free Events Only</FormLabel>
        <FormControl>
          <Switch
            checked={filters.onlyFreeEvents}
            onCheckedChange={(checked) => setFilter("onlyFreeEvents", checked)}
          />
        </FormControl>
      </FormItem>

      <FormItem className={cn(filters.onlyFreeEvents && "opacity-50")}>
        <div className="flex items-center justify-between mb-2">
          <FormLabel>Price Range</FormLabel>
          <span className="text-sm text-muted-foreground">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>
        <FormControl>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={filters.priceRange}
            onValueChange={(value) => setFilter("priceRange", value)}
            disabled={filters.onlyFreeEvents}
            className="pt-2"
          />
        </FormControl>
      </FormItem>
    </>
  );
}
