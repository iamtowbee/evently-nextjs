import { DateRange } from "react-day-picker";

export interface FilterState {
  location: string;
  eventType: string;
  sortBy: string;
  dateRange: DateRange | undefined;
}
