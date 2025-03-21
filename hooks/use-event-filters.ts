"use client";

import { create } from "zustand";
import { FilterState } from "@/types/filters";
import { useSearchParams } from "next/navigation";

interface EventFiltersStore {
  filters: FilterState;
  hasActiveFilters: boolean;
  setFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const defaultFilters: FilterState = {
  searchTerm: "",
  category: "",
  location: "",
  priceRange: [0, 1000],
  onlyFreeEvents: false,
  date: undefined,
  sortBy: "newest",
};

export const useEventFilters = create<EventFiltersStore>((set, get) => ({
  filters: defaultFilters,
  hasActiveFilters: false,

  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters, [key]: value };
      const hasActive =
        newFilters.date !== undefined ||
        newFilters.location !== "" ||
        newFilters.priceRange[0] > 0 ||
        newFilters.priceRange[1] < 1000 ||
        newFilters.onlyFreeEvents ||
        newFilters.sortBy !== "newest" ||
        newFilters.searchTerm !== "";

      return {
        filters: newFilters,
        hasActiveFilters: hasActive,
      };
    });

    // Auto-apply filters after a short delay
    const timeoutId = setTimeout(() => {
      get().applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  },

  resetFilters: () => {
    set({ filters: defaultFilters, hasActiveFilters: false });
    get().applyFilters();
  },

  applyFilters: () => {
    const { filters } = get();
    const params = new URLSearchParams(window.location.search);

    // Update URL params based on filters
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === "" ||
        (key === "sortBy" && value === "newest") ||
        (key === "priceRange" && value[0] === 0 && value[1] === 1000) ||
        (key === "onlyFreeEvents" && !value)
      ) {
        params.delete(key);
      } else if (key === "date" && value) {
        params.set(key, (value as Date).toISOString());
      } else if (key === "priceRange") {
        params.set("minPrice", String(value[0]));
        params.set("maxPrice", String(value[1]));
      } else {
        params.set(key, String(value));
      }
    });

    // Update URL without full page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  },
}));
