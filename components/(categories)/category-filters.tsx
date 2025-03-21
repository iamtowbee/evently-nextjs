"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useTransition } from "react";
import { debounce } from "@/lib/utils";

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const debouncedSearch = debounce((value: string) => {
    startTransition(() => {
      router.push(
        `/categories?${createQueryString({
          q: value || null,
        })}`
      );
    });
  }, 300);

  return (
    <div className="flex gap-4 mb-8 items-center">
      <div className="flex-1">
        <Input
          placeholder="Search categories..."
          className="max-w-sm"
          defaultValue={searchParams?.get("q") ?? ""}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>
      <Select
        defaultValue={searchParams?.get("sort") ?? "name"}
        onValueChange={(value) => {
          startTransition(() => {
            router.push(
              `/categories?${createQueryString({
                sort: value === "name" ? null : value,
              })}`
            );
          });
        }}
      >
        <SelectTrigger className="w-fit sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort by Name</SelectItem>
          <SelectItem value="events">Sort by Events</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
