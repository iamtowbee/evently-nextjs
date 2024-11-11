export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  image: string;
  price?: number;
}

export interface FilterState {
  searchTerm: string;
  category: string;
  date?: Date;
  location: string;
  priceRange: [number, number];
  onlyFreeEvents: boolean;
}
