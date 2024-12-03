import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prisma } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export type DatabaseError = {
  code: string;
  message: string;
  isRetryable: boolean;
};

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback: T,
  retries = 3,
  delay = 1000
): Promise<{ data: T | null; error: DatabaseError | null }> {
  let lastError: any = null;
  let attempts = 0;

  while (attempts < retries) {
    try {
      const result = await operation();
      return { data: result, error: null };
    } catch (error) {
      lastError = error;
      attempts++;

      if (error instanceof Prisma.PrismaClientInitializationError) {
        // Connection errors are retryable
        if (attempts < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempts));
          continue;
        }
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Known Prisma errors, might not be retryable
        return {
          data: fallback,
          error: {
            code: error.code,
            message: "Database request failed",
            isRetryable: false,
          },
        };
      } else {
        // Unknown errors, return immediately
        return {
          data: fallback,
          error: {
            code: "UNKNOWN_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            isRetryable: false,
          },
        };
      }
    }
  }

  // If we've exhausted retries
  return {
    data: fallback,
    error: {
      code: lastError?.code || "CONNECTION_ERROR",
      message: "Failed to connect to database after multiple attempts",
      isRetryable: true,
    },
  };
}

const EVENT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";

export function getImageUrl(url: string | null) {
  if (!url) return EVENT_PLACEHOLDER;
  if (url.startsWith("http")) return url;
  return `/images/${url}`;
}
