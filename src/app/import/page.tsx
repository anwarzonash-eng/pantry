import { ImportForm } from "./ImportForm";

export default function ImportPage() {
  return (
    <section>
      <h1>Import a recipe</h1>
      <p className="muted">Paste a recipe in Markdown, for example one exported from pantry.</p>
      <ImportForm />
    </section>
  );
}
