"use client";

import { useState } from "react";

/**
 * navigator.clipboard only exists on https or localhost. Opened over plain
 * http on the home network it is undefined, so fall back to the old way.
 */
async function copy(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      className="link-button"
      onClick={async () => {
        setState((await copy(text)) ? "copied" : "failed");
        setTimeout(() => setState("idle"), 2000);
      }}
    >
      {state === "copied" ? "Copied" : state === "failed" ? "Could not copy" : "Copy as text"}
    </button>
  );
}
