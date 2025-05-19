import { DateRange } from "react-day-picker";

export interface FilterState {
  searchTerm: string;
  category: string;
  date?: Date;
  location: string;
  priceRange: [number, number];
  onlyFreeEvents: boolean;
  sortBy: "newest" | "oldest" | "price-low" | "price-high";
}
