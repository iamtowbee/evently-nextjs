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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FilterState } from "@/types/filters";

const formSchema = z.object({
  location: z.string().optional(),
  eventType: z.string().optional(),
  dateRange: z.date().optional(),
  sortBy: z.string().optional(),
});

interface FilterOptionsProps {
  onChange: (filters: FilterState) => void;
}

export function FilterOptions({ onChange }: FilterOptionsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      eventType: "",
      sortBy: "newest",
    },
  });

  // Watch form values and call onChange
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value as FilterState);
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
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  className="rounded-md border bg-muted"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
