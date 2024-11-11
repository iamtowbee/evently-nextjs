import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link className="flex items-center space-x-2" href="/">
            <span className="text-xl font-bold">Evently</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              className="text-sm font-medium hover:underline"
              href="#concerts"
            >
              Concerts
            </Link>
            <Link
              className="text-sm font-medium hover:underline"
              href="#workshops"
            >
              Workshops
            </Link>
            <Link
              className="text-sm font-medium hover:underline"
              href="#festivals"
            >
              Festivals
            </Link>
            <Link
              className="text-sm font-medium hover:underline"
              href="#exhibitions"
            >
              Exhibitions
            </Link>
            <Link
              className="text-sm font-medium hover:underline"
              href="#sports"
            >
              Sports
            </Link>
          </div>
          <div className="hidden lg:block">
            <Button>Create Event</Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                <Link
                  className="text-sm font-medium hover:underline"
                  href="#concerts"
                >
                  Concerts
                </Link>
                <Link
                  className="text-sm font-medium hover:underline"
                  href="#workshops"
                >
                  Workshops
                </Link>
                <Link
                  className="text-sm font-medium hover:underline"
                  href="#festivals"
                >
                  Festivals
                </Link>
                <Link
                  className="text-sm font-medium hover:underline"
                  href="#exhibitions"
                >
                  Exhibitions
                </Link>
                <Link
                  className="text-sm font-medium hover:underline"
                  href="#sports"
                >
                  Sports
                </Link>
                <Button className="w-full">Create Event</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
