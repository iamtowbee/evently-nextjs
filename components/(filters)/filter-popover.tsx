"use client";

import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEventFilters } from "@/hooks/use-event-filters";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const filterFormSchema = z.object({
  sortBy: z
    .enum(["newest", "oldest", "price-low", "price-high"])
    .default("newest"),
  date: z.date().optional(),
  location: z.string().optional(),
  priceRange: z.tuple([z.number(), z.number()]).default([0, 1000]),
  onlyFreeEvents: z.boolean().default(false),
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

interface FilterPopoverProps {
  children: React.ReactNode;
}

export function FilterPopover({ children }: FilterPopoverProps) {
  const { hasActiveFilters, filters } = useEventFilters();

  // Initialize form with current filter values
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      sortBy: filters.sortBy,
      date: filters.date,
      location: filters.location,
      priceRange: filters.priceRange,
      onlyFreeEvents: filters.onlyFreeEvents,
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? "outline" : "outline"}
          size="icon"
          className="shrink-0 h-10 w-10"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Form {...form}>
          <div className="space-y-4">{children}</div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
