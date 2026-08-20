"use client";

import { useEffect } from "react";

/** Press "/" anywhere on the recipe list to jump to the search box. */
export function SearchShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || target.closest("input, textarea, select, [contenteditable]")) return;
      const box = document.querySelector<HTMLInputElement>('input[name="q"]');
      if (box) {
        e.preventDefault();
        box.focus();
        box.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
