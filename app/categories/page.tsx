import { Suspense } from "react";
import { getCategories } from "@/lib/actions/category";
import { CategoryCard } from "@/components/(categories)/category-card";
import { CategoryCardSkeleton } from "@/components/(categories)/category-card-skeleton";
import { CategoryFilters } from "@/components/(categories)/category-filters";

export const metadata = {
  title: "Browse Categories | Meetly",
  description: "Discover and explore event categories on Meetly",
};

export const dynamic = "force-dynamic";

function CategoryCardList({ categories }: { categories: any[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

function LoadingCategories() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

type SearchParams = {
  sort?: string;
  q?: string;
};

type PageProps = {
  params: {};
  searchParams: Promise<SearchParams>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  const { q = "", sort = "name" } = await searchParams;

  try {
    const data = await getCategories({
      includeEventCount: true,
      includeImage: true,
    });

    if (!data) {
      return (
        <main className="flex-1 py-12">
          <div className="container">
            <div className="text-center">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          </div>
        </main>
      );
    }

    let categories = data.categories || [];

    // Filter categories if search query exists
    if (q) {
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sort categories
    categories.sort((a, b) => {
      if (sort === "events") {
        return (b._count?.events || 0) - (a._count?.events || 0);
      }
      // Default to sorting by name
      return a.name.localeCompare(b.name);
    });

    return (
      <main className="flex-1 py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Browse events by category</p>
          </div>

          <CategoryFilters />

          <Suspense fallback={<LoadingCategories />}>
            {categories.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground">
                  {q
                    ? "No matching categories found"
                    : "No categories available"}
                </p>
              </div>
            ) : (
              <CategoryCardList categories={categories} />
            )}
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error in CategoriesPage:", error);
    return (
      <main className="flex-1 py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-red-500">Error loading categories</p>
          </div>
        </div>
      </main>
    );
  }
}
