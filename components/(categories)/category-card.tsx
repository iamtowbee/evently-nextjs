import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/events/category/${category.slug}`}>
      <Card className="group relative h-[280px] overflow-hidden transition-all hover:border-primary hover:shadow-md">
        {/* Image with overlay */}
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(category.card_image_url || null, "category")}
            alt={category.name}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={100}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/5" />
        </div>

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white mb-2 font-heading group-hover:text-primary-foreground transition-colors duration-300">
            {category.name}
          </h3>
          <p className="line-clamp-2 text-sm text-white/90 mb-4">
            {category.description || "No description available"}
          </p>
          <div className="flex items-center justify-between opacity-0 transform translate-y-4 transition-all duration-500 delay-150 group-hover:opacity-100 group-hover:translate-y-0">
            <Badge className="bg-primary/60 hover:bg-primary/30 text-white border-primary/30 shadow-sm shadow-primary/20">
              {category._count?.events || 0} events
            </Badge>
            <span className="text-sm text-white/90 flex items-center gap-1">
              Browse events
              <ArrowRight className="h-4 w-4 group-hover:animate-pulse-right" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
