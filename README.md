# pantry

A small self-hosted recipe box with a weekly meal plan and a shopping list. Type recipes in plain text; pantry understands the ingredient lines ("1½ cups flour", "2-3 cloves garlic, crushed"), so it can scale them and add up what you need for the week.

Built with Next.js (App Router), TypeScript and SQLite (better-sqlite3). Everything is stored in one file under `data/`.

## Run it

Needs Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run seed       # optional: a few sample recipes
```

`npm run backup` writes a JSON backup to `backups/` and keeps the last 14, which is easy to run from cron. The database is `data/pantry.db`. Set `DATA_DIR` to keep it somewhere else (see `.env.example`).

## What works so far

- Add, edit and delete recipes
- Ingredient lines are parsed into amount, unit, name and note (fractions, ½-style characters, ranges, "a pinch of")
- Tags, filter by tag, search by title or ingredient
- Readable URLs (`/recipes/chickpea-curry`) that stay the same when you rename a recipe
- Servings control on each recipe that scales the amounts, shown as ½ ⅓ ¼ where it makes sense
- Week plan with breakfast, lunch and dinner, optionally cooking more or fewer servings than the recipe makes
- Shopping list made from the week plan: amounts of the same ingredient are added up (200 g + 0.5 kg = 700 g), grouped by supermarket aisle, tick items off, add your own, copy it as text
- Pantry: things you already have are left off the list ("tomato" covers "tomatoes")
- Import from Markdown, from a recipe website link (schema.org data), or from pasted page source; export any recipe as Markdown
- JSON backup and restore of everything
- Favourites, notes, source link, photo, prep and cook times, sections inside the ingredient list ("For the sauce:")
- Cook mode: one step at a time in large text, keeps the screen on
- Metric or US units, copy last week's plan, dinner ideas you have not had in a while
- Dark mode and a print layout

### Docker

```bash
docker build -t pantry .
docker run -d -p 3000:3000 -v pantry-data:/app/data pantry
```

The database lives in the `pantry-data` volume.

## Tests

```bash
npm test           # vitest
npm run typecheck
```
