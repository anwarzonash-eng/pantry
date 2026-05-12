import { HtmlForm } from "./HtmlForm";
import { ImportForm } from "./ImportForm";
import { RestoreForm } from "./RestoreForm";

export default function ImportPage() {
  return (
    <section>
      <h1>Import a recipe</h1>
      <p className="muted">Paste a recipe in Markdown, for example one exported from pantry.</p>
      <ImportForm />

      <h2>From a recipe website</h2>
      <p className="muted">
        Most recipe sites include the recipe as structured data in the page. Paste a link, or the page source if the site
        blocks downloads.
      </p>
      <HtmlForm />

      <h2>Backup</h2>
      <p>
        <a href="/api/backup" className="button">
          Download a backup
        </a>{" "}
        <span className="muted">All recipes, the meal plan and the pantry as one JSON file.</span>
      </p>
      <RestoreForm />
    </section>
  );
}
