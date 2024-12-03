import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex-1">
      <div className="container flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="relative select-none">
          <Calendar className="h-24 w-24 text-muted-foreground/70" />
          <div className="absolute -right-2 -top-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            404
          </div>
        </div>
        <h1 className="text-center text-4xl font-bold">Event Not Found</h1>
        <p className="text-center text-muted-foreground">
          The event you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>
    </main>
  );
}
