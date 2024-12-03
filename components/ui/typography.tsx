import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface TypographyProps extends HTMLAttributes<HTMLHeadingElement> {
  variant?: "h1" | "h2" | "h3" | "h4";
}

export function Heading({
  children,
  variant = "h1",
  className,
  ...props
}: TypographyProps) {
  const baseStyles = "font-heading tracking-tight";

  const variants = {
    h1: "text-4xl font-bold md:text-5xl",
    h2: "text-3xl font-semibold md:text-4xl",
    h3: "text-2xl font-semibold md:text-3xl",
    h4: "text-xl font-semibold md:text-2xl",
  };

  switch (variant) {
    case "h1":
      return (
        <h1 className={cn(baseStyles, variants[variant], className)} {...props}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 className={cn(baseStyles, variants[variant], className)} {...props}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 className={cn(baseStyles, variants[variant], className)} {...props}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 className={cn(baseStyles, variants[variant], className)} {...props}>
          {children}
        </h4>
      );
  }
}

export function Text({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    >
      {children}
    </p>
  );
}
