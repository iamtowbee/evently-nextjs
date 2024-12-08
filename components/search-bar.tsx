"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FilterOptions } from "./filter-options";
import { FilterState } from "@/types/filters";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchParams } from "next/navigation";

interface SearchBarProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export function SearchBar({
  onSearch,
  onFilterChange,
  isLoading = false,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(
    searchParams.get("search") || ""
  );
  const [localLoading, setLocalLoading] = React.useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update search term when URL params change
  React.useEffect(() => {
    const currentSearchTerm = searchParams.get("search") || "";
    if (currentSearchTerm !== searchTerm) {
      setSearchTerm(currentSearchTerm);
    }
  }, [searchParams, searchTerm]);

  // Handle search when debounced term changes
  React.useEffect(() => {
    const handleSearch = async () => {
      setLocalLoading(true);
      await onSearch(debouncedSearchTerm);
      setLocalLoading(false);
    };

    handleSearch();
  }, [debouncedSearchTerm, onSearch]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchTerm("");
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm("");
  };

  // Handle filter changes
  const handleFilterChange = (filters: Partial<FilterState>) => {
    onFilterChange({
      searchTerm: debouncedSearchTerm,
      category: "",
      date: undefined,
      location: "",
      priceRange: [0, 1000],
      onlyFreeEvents: false,
      ...filters,
    });
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 pr-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {isLoading || localLoading ? (
              <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : searchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={
              showFilters
                ? "bg-primary/10"
                : "bg-muted border-0 hover:bg-muted/80"
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        {showFilters && <FilterOptions onChange={handleFilterChange} />}
      </CardContent>
    </Card>
  );
}
