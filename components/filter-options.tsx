"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FilterState } from "@/types/filters";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  location: z.string().optional(),
  eventType: z.string().optional(),
  dateRange: z.date().optional(),
  sortBy: z.string().optional(),
  priceRange: z.array(z.number()).length(2).optional(),
  onlyFreeEvents: z.boolean().optional(),
});

interface FilterOptionsProps {
  onChange: (filters: Partial<FilterState>) => void;
}

export function FilterOptions({ onChange }: FilterOptionsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      eventType: "",
      sortBy: "newest",
      priceRange: [0, 1000],
      onlyFreeEvents: false,
    },
  });

  // Watch form values and call onChange
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange({
        ...value,
        date: value.dateRange,
        priceRange: value.onlyFreeEvents ? [0, 0] : value.priceRange,
      } as FilterState);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  return (
    <Form {...form}>
      <form className="grid gap-4 pt-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter location..."
                  className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-muted border-0 focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort By</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-muted border-0 focus:ring-1 focus:ring-primary">
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
          )}
        />

        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>Date</FormLabel>
              <div className="-mx-2 bg-muted rounded-md">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onlyFreeEvents"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Free Events Only</FormLabel>
                <FormDescription>Show only free events</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Range</FormLabel>
              <div className="flex items-center justify-between">
                <FormDescription>
                  ${field.value?.[0] || 0} - ${field.value?.[1] || 1000}
                </FormDescription>
              </div>
              <FormControl>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={field.value || [0, 1000]}
                  onValueChange={field.onChange}
                  disabled={form.watch("onlyFreeEvents")}
                  className={cn(
                    "pt-2",
                    form.watch("onlyFreeEvents") && "opacity-50"
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
