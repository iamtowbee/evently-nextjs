export interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  priceRange: [number, number];
  onlyFreeEvents: boolean;
  date: Date | undefined;
  sortBy: "newest" | "oldest" | "price-low" | "price-high";
}
