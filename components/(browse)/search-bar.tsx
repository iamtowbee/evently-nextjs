"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { useEventFilters } from "@/hooks/use-event-filters";
import { FilterPopover } from "@/components/(filters)/filter-popover";
import {
  SortByFilter,
  DateFilter,
  LocationFilter,
  PriceFilter,
} from "@/components/(filters)/filter-components";

interface SearchBarProps {
  className?: string;
  showDateFilter?: boolean;
  showPriceFilter?: boolean;
  showLocationFilter?: boolean;
  showSortBy?: boolean;
}

export function SearchBar({
  className,
  showDateFilter = true,
  showPriceFilter = true,
  showLocationFilter = true,
  showSortBy = true,
}: SearchBarProps) {
  const { filters, setFilter, applyFilters } = useEventFilters();
  const [localSearchTerm, setLocalSearchTerm] = React.useState(
    filters.searchTerm
  );
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  const [isSearching, setIsSearching] = React.useState(false);

  // Update search when debounced term changes
  React.useEffect(() => {
    const updateSearch = async () => {
      setIsSearching(true);
      setFilter("searchTerm", debouncedSearchTerm);
      applyFilters();
      setIsSearching(false);
    };

    updateSearch();
  }, [debouncedSearchTerm, setFilter, applyFilters]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setLocalSearchTerm("");
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-9 pr-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : localSearchTerm ? (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setLocalSearchTerm("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            ) : null}
          </div>

          <FilterPopover>
            {showSortBy && <SortByFilter />}
            {showDateFilter && <DateFilter />}
            {showLocationFilter && <LocationFilter />}
            {showPriceFilter && <PriceFilter />}
          </FilterPopover>
        </div>
      </CardContent>
    </Card>
  );
}
