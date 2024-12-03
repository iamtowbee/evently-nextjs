"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/sanity/lib/client";
import { categoriesQuery } from "@/sanity/lib/queries";
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
import { useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CategorySelectProps {
  field: any;
  form: any; // We'll need the form context for the "Other" description
}

export function CategorySelect({ field, form }: CategorySelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return client.fetch<Category[]>(categoriesQuery);
    },
  });

  const handleCategoryChange = (value: string) => {
    field.onChange(value);
    setShowOtherInput(value === "other");

    // Reset the other category description when switching away from "Other"
    if (value !== "other") {
      form.setValue("otherCategoryDescription", "");
    }
  };

  return (
    <>
      <FormItem>
        <FormLabel>Category</FormLabel>
        <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
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
            ) : categories?.length ? (
              <>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  Other (Suggest a category)
                </SelectItem>
              </>
            ) : (
              <SelectItem value="no-categories" disabled>
                No categories found
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      {showOtherInput && (
        <FormItem>
          <FormLabel>Suggest a Category</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., Virtual Events, Workshops, etc."
              {...form.register("otherCategoryDescription")}
            />
          </FormControl>
          <FormDescription>
            Your suggestion will be reviewed by our team.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    </>
  );
}
