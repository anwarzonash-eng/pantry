"use client";

import { useActionState } from "react";
import { importMarkdown, type ImportState } from "./actions";

const EXAMPLE = `# Tomato Soup

Serves: 4
Tags: lunch

## Ingredients
- 1 kg tomatoes
- 1 onion

## Steps
1. Roast the tomatoes.
2. Blend with the onion.`;

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importMarkdown, {});
  return (
    <form action={action} className="recipe-form">
      <label>
        Markdown
        <textarea name="markdown" rows={16} placeholder={EXAMPLE} required />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import"}
      </button>
    </form>
  );
}
