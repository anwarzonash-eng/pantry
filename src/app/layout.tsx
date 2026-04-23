import type { Metadata } from "next";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "pantry",
  description: "Recipes, meal plan and shopping list",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="nav">
            <Link href="/" className="logo">
              pantry
            </Link>
            <NavLinks />
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
