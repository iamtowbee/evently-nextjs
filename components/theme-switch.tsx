"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 rounded-md"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-8 w-8 rounded-md",
        "text-foreground",
        "hover:text-primary-foreground hover:bg-primary",
        "transition-colors"
      )}
      onClick={() => {
        setTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
        );
      }}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )}
      />
      <Monitor
        className={cn(
          "absolute h-4 w-4 transition-all duration-200",
          theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        )}
      />
      <span className="sr-only">
        {theme === "light"
          ? "Switch to dark theme"
          : theme === "dark"
            ? "Switch to system theme"
            : "Switch to light theme"}
      </span>
    </Button>
  );
}
