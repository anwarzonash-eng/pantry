import type { Metadata } from "next";
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
          <a href="/" className="logo">pantry</a>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
