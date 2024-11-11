"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FilterOptionsProps {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
}

interface FilterState {
  location: string;
  eventType: string;
  sortBy: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  quickDates: string[];
}

const eventTypes = [
  "All Events",
  "Music",
  "Food",
  "Sports",
  "Art",
  "Technology",
  "Networking",
];

const sortOptions = [
  "Date: Newest First",
  "Date: Oldest First",
  "Price: Low to High",
  "Price: High to Low",
  "Popularity",
];

const quickDateOptions = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "weekend", label: "Weekend" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export function FilterOptions({ onFilterChange, onClose }: FilterOptionsProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    location: "",
    eventType: "All Events",
    sortBy: "Date: Newest First",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    quickDates: [],
  });

  const handleFilterChange = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
    onClose?.();
  };

  const handleReset = () => {
    const resetFilters = {
      location: "",
      eventType: "All Events",
      sortBy: "Date: Newest First",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      quickDates: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="w-[300px] p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Enter location"
          value={filters.location}
          onChange={(e) => handleFilterChange({ location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Event Type</Label>
        <Select
          value={filters.eventType}
          onValueChange={(value) => handleFilterChange({ eventType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange({ sortBy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date Range</Label>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from
                  ? filters.dateRange.from.toLocaleDateString()
                  : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={(date) =>
                  handleFilterChange({
                    dateRange: { ...filters.dateRange, from: date },
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to
                  ? filters.dateRange.to.toLocaleDateString()
                  : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={(date) =>
                  handleFilterChange({
                    dateRange: { ...filters.dateRange, to: date },
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quick Select</Label>
        <div className="space-y-2">
          {quickDateOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={filters.quickDates.includes(option.id)}
                onCheckedChange={(checked) => {
                  handleFilterChange({
                    quickDates: checked
                      ? [...filters.quickDates, option.id]
                      : filters.quickDates.filter((id) => id !== option.id),
                  });
                }}
              />
              <Label htmlFor={option.id} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Button
          className="w-full bg-[#7e22ce] hover:bg-[#6b21a8]"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
