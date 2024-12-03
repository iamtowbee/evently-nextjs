"use client";

import * as React from "react";
import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface PrettyDateProps extends React.HTMLAttributes<HTMLTimeElement> {
  date: string | Date;
  format?: "relative" | "iso" | "full" | "short" | "event";
  suffix?: boolean;
}

export function PrettyDate({
  date,
  format: formatType = "relative",
  suffix = true,
  className,
  ...props
}: PrettyDateProps) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return null;
  }

  const getFormattedDate = () => {
    switch (formatType) {
      case "relative":
        return formatDistanceToNow(dateObj, { addSuffix: suffix });
      case "iso":
        return format(dateObj, "yyyy-MM-dd");
      case "full":
        return format(dateObj, "EEEE, MMMM do, yyyy 'at' h:mm a");
      case "short":
        return format(dateObj, "MMM d, yyyy");
      case "event":
        const isThisYear = new Date().getFullYear() === dateObj.getFullYear();
        // If it's this year, omit the year
        return isThisYear
          ? format(dateObj, "EEE, MMM d • h:mm a")
          : format(dateObj, "EEE, MMM d, yyyy • h:mm a");
      default:
        return formatDistanceToNow(dateObj, { addSuffix: suffix });
    }
  };

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={cn("text-sm", className)}
      {...props}
    >
      {getFormattedDate()}
    </time>
  );
}
