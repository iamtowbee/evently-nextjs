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
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
  location: z.string().optional(),
  dateRange: z.date().optional(),
  sortBy: z.string().optional(),
  priceRange: z.array(z.number()).length(2).optional(),
  onlyFreeEvents: z.boolean().optional(),
});

interface FilterOptionsProps {
  onChange: (filters: Partial<FilterState>) => void;
}

export function FilterOptions({ onChange }: FilterOptionsProps) {
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: searchParams.get("location") || "",
      sortBy: searchParams.get("sort") || "newest",
      dateRange: searchParams.get("date")
        ? new Date(searchParams.get("date")!)
        : undefined,
      priceRange: [
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || 1000,
      ],
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
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="sortBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort By</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          )}
        />

        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
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
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
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
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onlyFreeEvents"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <FormLabel className="font-normal">Free Events Only</FormLabel>
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
            <FormItem
              className={cn(form.watch("onlyFreeEvents") && "opacity-50")}
            >
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Price Range</FormLabel>
                <span className="text-sm text-muted-foreground">
                  ${field.value?.[0] || 0} - ${field.value?.[1] || 1000}
                </span>
              </div>
              <FormControl>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={field.value || [0, 1000]}
                  onValueChange={field.onChange}
                  disabled={form.watch("onlyFreeEvents")}
                  className="pt-2"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
