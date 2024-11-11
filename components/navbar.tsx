"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  categories: string[];
}

export function Navbar({ categories }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="container flex h-14 items-center justify-between mx-auto">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-xl font-bold">Evently</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                {categories.map((category) => (
                  <Link
                    key={category}
                    className="text-sm font-medium hover:underline"
                    href={`#${category}`}
                  >
                    {category}
                  </Link>
                ))}
                <Button className="w-full">Create Event</Button>
              </nav>
            </SheetContent>
          </Sheet>
          <nav className="hidden md:flex items-center space-x-4">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category}
                className="text-sm font-medium hover:underline"
                href={`#${category}`}
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
        <Button className="hidden md:block">Create Event</Button>
      </div>
    </header>
  );
}
