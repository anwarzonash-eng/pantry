"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** One step at a time, big text, and the screen stays on while you cook. */
export function CookMode({ title, slug, steps, ingredients }: { title: string; slug: string; steps: string[]; ingredients: string[] }) {
  const [i, setI] = useState(0);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request("screen");
        setAwake(!!lock);
      } catch {
        setAwake(false);
      }
    };
    request();
    // the lock is dropped when the tab is hidden, ask again when it comes back
    const onVisible = () => document.visibilityState === "visible" && request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // leave keys alone while a button or the ingredient list has focus
      if ((e.target as HTMLElement).closest("button, summary, input")) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault(); // space also scrolled the page down
        setI((n) => Math.min(steps.length - 1, n + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setI((n) => Math.max(0, n - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  if (steps.length === 0) return <p>This recipe has no steps yet.</p>;

  return (
    <div className="cook">
      <div className="cook-head">
        <Link href={`/recipes/${slug}`}>← {title}</Link>
        <span className="muted">
          Step {i + 1} of {steps.length}
          {awake && " · screen stays on"}
        </span>
      </div>
      <p className="cook-step">{steps[i]}</p>
      <div className="cook-nav">
        <button className="button" onClick={() => setI(i - 1)} disabled={i === 0}>
          Back
        </button>
        <button className="button" onClick={() => setI(i + 1)} disabled={i === steps.length - 1}>
          Next
        </button>
      </div>
      <details className="cook-ingredients">
        <summary>Ingredients</summary>
        <ul>
          {ingredients.map((l, n) => (
            <li key={n}>{l}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
