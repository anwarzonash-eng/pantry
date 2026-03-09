import type { Metadata } from "next";
import Link from "next/link";
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
            <Link href="/">Recipes</Link>
            <Link href="/plan">Plan</Link>
            <Link href="/shopping">Shopping</Link>
            <Link href="/pantry">Pantry</Link>
            <Link href="/recipes/new">Add</Link>
            <Link href="/import">Import</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
