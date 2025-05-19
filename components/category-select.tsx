"use client";

import { useState } from "react";
import { getCategories } from "@/lib/actions/category";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface CategorySelectProps {
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

export function CategorySelect({
  onValueChange,
  defaultValue,
}: CategorySelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategories();
      return result?.categories || [];
    },
  });

  const handleCategoryChange = (value: string) => {
    onValueChange(value);
    setShowOtherInput(value === "other");
    if (value !== "other") {
      setOtherCategory("");
    }
  };

  const handleOtherCategoryChange = (value: string) => {
    setOtherCategory(value);
    // You could implement logic here to handle the suggested category
    // For example, store it in a separate table or send it to an admin
  };

  return (
    <>
      <Select onValueChange={handleCategoryChange} defaultValue={defaultValue}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoadingCategories ? (
            <SelectItem value="loading" disabled>
              Loading categories...
            </SelectItem>
          ) : categoriesData?.length ? (
            <>
              {categoriesData.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (Suggest a category)</SelectItem>
            </>
          ) : (
            <SelectItem value="no-categories" disabled>
              No categories found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <div className="mt-2">
        <FormDescription>
          Select the most appropriate category for your event
        </FormDescription>
        <FormMessage />
      </div>

      {showOtherInput && (
        <div className="mt-4">
          <div className="mb-2">
            <FormLabel>Suggest a Category</FormLabel>
          </div>
          <FormControl>
            <Input
              placeholder="e.g., Virtual Events, Workshops, etc."
              value={otherCategory}
              onChange={(e) => handleOtherCategoryChange(e.target.value)}
            />
          </FormControl>
          <div className="mt-2">
            <FormDescription>
              Your suggestion will be reviewed by our team.
            </FormDescription>
            <FormMessage />
          </div>
        </div>
      )}
    </>
  );
}
