import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Category } from "@/types/category";

interface CategoryTagsProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
}

export function CategoryTags({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTagsProps) {
  // Find the selected category by slug
  const selectedCategoryId = React.useMemo(() => {
    if (!selectedCategory) return undefined;
    return categories.find((cat) => cat.slug === selectedCategory)?.id;
  }, [categories, selectedCategory]);

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
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className={cn(
                "transition-all",
                selectedCategoryId === category.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "bg-background hover:text-primary hover:border-primary hover:bg-muted"
              )}
              onClick={() => onSelectCategory(category.id)}
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
