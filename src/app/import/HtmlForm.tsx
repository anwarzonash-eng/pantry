"use client";

import { useActionState } from "react";
import { importHtml, type HtmlImportState } from "./html";

export function HtmlForm() {
  const [state, action, pending] = useActionState<HtmlImportState, FormData>(importHtml, {});
  return (
    <form action={action} className="recipe-form">
      <label>
        Page source
        <textarea name="html" rows={6} placeholder="Open the recipe page, View source, copy all of it and paste it here" required />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Reading…" : "Import from page source"}
      </button>
    </form>
  );
}
