"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterOptions } from "./filter-options";

interface SearchBarProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: any) => void;
}

export function SearchBar({ onSearch, onFilterChange }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-3xl w-full mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <FilterOptions
            onFilterChange={onFilterChange}
            onClose={() => setIsFiltersOpen(false)}
          />
        </PopoverContent>
      </Popover>
      <Button
        onClick={handleSearch}
        className="bg-[#7e22ce] hover:bg-[#6b21a8] text-white"
      >
        Search
      </Button>
    </div>
  );
}
