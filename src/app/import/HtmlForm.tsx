"use client";

import { useActionState } from "react";
import { importHtml, type HtmlImportState } from "./html";

export function HtmlForm() {
  const [state, action, pending] = useActionState<HtmlImportState, FormData>(importHtml, {});
  return (
    <form action={action} className="recipe-form">
      <label>
        Link
        <input name="url" type="url" placeholder="https://" />
      </label>
      <details>
        <summary className="muted">or paste the page source</summary>
        <textarea name="html" rows={6} placeholder="Open the recipe page, View source, copy all of it and paste it here" />
      </details>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Reading…" : "Import"}
      </button>
    </form>
  );
}
