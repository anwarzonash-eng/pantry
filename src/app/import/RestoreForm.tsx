"use client";

import { useActionState } from "react";
import { restoreBackup, type RestoreState } from "./restore";

export function RestoreForm() {
  const [state, action, pending] = useActionState<RestoreState, FormData>(restoreBackup, {});
  return (
    <form action={action} className="recipe-form">
      <label>
        Restore from a backup file
        <input type="file" name="file" accept="application/json,.json" />
      </label>
      <label className="inline">
        <input type="checkbox" name="confirm" /> Replace all recipes, the plan and the pantry
      </label>
      {state.error && <p className="error">{state.error}</p>}
      {state.done && <p className="ok">{state.done}</p>}
      <button className="button danger" type="submit" disabled={pending}>
        {pending ? "Restoring…" : "Restore"}
      </button>
    </form>
  );
}
