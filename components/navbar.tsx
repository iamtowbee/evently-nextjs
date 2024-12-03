"use client";

import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AuthButton } from "./auth-button";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Category } from "@/types/category";

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center relative">
              <p className="text-2xl tracking-tight font-[450] font-outfit">
                meetly
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-primary ml-0 absolute -right-1 top-[69%]"></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
            <div className="flex space-x-6 items-center">
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/events/category/${category.slug}`}
                  className={cn(
                    "group relative inline-flex items-center h-16 px-2 pt-2",
                    "text-sm font-medium text-foreground/80 hover:text-primary",
                    "border-b-2 border-transparent hover:border-b-[3px] hover:border-primary",
                    "transition-colors duration-200 overflow-hidden"
                  )}
                >
                  <span className="relative z-10">{category.name}</span>
                  <span
                    className={cn(
                      "absolute inset-0 bg-primary/5",
                      "transform translate-y-full transition-transform duration-300 ease-out",
                      "group-hover:translate-y-0 group-hover:duration-500 group-hover:ease-out",
                      "will-change-transform transform-gpu"
                    )}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {status === "authenticated" && (
              <Button asChild size="sm" className="gap-2">
                <Link href="/events/create">
                  <Plus className="h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            )}
            <ThemeSwitch />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
