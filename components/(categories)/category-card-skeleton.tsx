import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryCardSkeleton() {
  return (
    <Card className="relative h-[280px] overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="relative h-full p-6 flex flex-col justify-end">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </Card>
  );
}
