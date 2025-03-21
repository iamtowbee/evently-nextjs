import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category } from "@/types/category";

interface CategoryTagsProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categorySlug: string | undefined) => void;
}

export function CategoryTags({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTagsProps) {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 py-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "transition-all",
              !selectedCategory
                ? "border-primary bg-primary/10 text-primary"
                : "bg-background hover:text-primary hover:border-primary hover:bg-muted"
            )}
            onClick={() => onSelectCategory(undefined)}
          >
            All Events
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className={cn(
                "transition-all",
                selectedCategory === category.slug
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-background hover:text-primary hover:border-primary hover:bg-muted"
              )}
              onClick={() => onSelectCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
