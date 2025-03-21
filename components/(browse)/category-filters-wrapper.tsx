"use client";

import { SearchBar } from "./search-bar";

export function CategoryFiltersWrapper() {
  return (
    <div className="flex items-center gap-4">
      <SearchBar className="flex-1 max-w-lg" />
    </div>
  );
}
