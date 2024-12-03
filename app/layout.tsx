import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";
import { getTopCategories } from "@/lib/actions/category";
import type { Category } from "@/types/category";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meetly",
  description: "Virtual meetings and physical events for everyone",
};

async function getNavCategories(): Promise<Category[]> {
  const result = await getTopCategories(5);
  if (!result?.categories) return [];

  return (result.categories as any[]).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Navbar categories={categories} />
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
