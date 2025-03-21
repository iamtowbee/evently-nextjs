"use client";

import Link from "next/link";
import { ThemeSwitch } from "./theme-switch";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { LogOut, Plus, User, LayoutDashboard, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import type { Category } from "@/types/category";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { AuthButton } from "./auth-button";
import React from "react";

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories = [] }: NavbarProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);

  // console.log("Sign in status", status);

  const handleSignOut = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: `${window.location.origin}/login`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center relative">
            <p className="text-2xl tracking-tight font-[450] font-outfit">
              meetly
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-primary ml-0 absolute -right-1 top-[69%]"></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:justify-center">
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
            <div className="hidden md:block">
              {status === "authenticated" && (
                <Button asChild size="sm" className="gap-2">
                  <Link href="/events/create">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              )}
            </div>
            <ThemeSwitch />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  {status === "authenticated" ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session?.user?.image || undefined}
                          alt={session?.user?.name || "User avatar"}
                        />
                        <AvatarFallback>
                          {session?.user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      Menu
                    </Button>
                  )}
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>
                      {status === "authenticated" ? (
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={session?.user?.image || undefined}
                              alt={session?.user?.name || "User avatar"}
                            />
                            <AvatarFallback>
                              {session?.user?.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 flex flex-col items-start">
                            <p className="text-sm font-medium leading-none">
                              {session?.user?.name}
                            </p>
                            <p className="text-sm text-muted-foreground w-[180px] truncate">
                              {session?.user?.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        "Menu"
                      )}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-4 flex flex-col">
                    {status === "authenticated" && (
                      <div className="mb-6">
                        <Button asChild className="w-full gap-2">
                          <Link href="/events/create">
                            <Plus className="h-4 w-4" />
                            Create Event
                          </Link>
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col space-y-3">
                      {categories?.map((category) => (
                        <Link
                          key={category.id}
                          href={`/events/category/${category.slug}`}
                          className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>

                    {status === "authenticated" && (
                      <>
                        <Separator className="my-6" />
                        <div className="flex flex-col space-y-4">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </div>
                        <Separator className="my-6" />
                        <button
                          type="button"
                          disabled={isLoading}
                          className="flex w-full items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/90 disabled:opacity-50"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoading ? "Signing out..." : "Sign out"}
                        </button>
                      </>
                    )}

                    {status !== "authenticated" && (
                      <div className="mt-6">
                        <Button asChild className="w-full">
                          <Link href="/login">Sign in</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Auth Button */}
            <div className="hidden md:block">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
