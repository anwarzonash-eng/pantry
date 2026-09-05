# How pantry is put together

A Next.js App Router app with one SQLite file. No API layer in between: pages are
server components that read the database directly, and changes go through server
actions. The only client components are the small interactive bits (servings
control, cook mode, copy button, nav).

## Layout

```
src/app/          pages, server actions ("use server" files next to the page that uses them)
src/components/   shared UI
src/lib/          everything else, framework-free and unit tested
scripts/          seed and backup, run with tsx
```

`src/lib` has no Next.js imports, so it can be tested with plain Vitest and an
in-memory database.

## Data

- `recipes.ingredients` and `recipes.steps` are stored as the text you typed, one
  line each. Parsing happens when reading (`lib/ingredients/parse.ts`), so a better
  parser improves old recipes too and nothing you typed is ever lost.
- Dates in the plan are `YYYY-MM-DD` strings in local time (`lib/dates.ts`), never
  `Date` objects, so meals do not move days across time zones.
- Migrations are an append-only list in `lib/migrations.ts`, tracked with
  `PRAGMA user_version`. Each runs once in a transaction.
- Foreign keys cascade from recipes to plan entries and tag links (migration 13).

## Ingredients

`parseIngredient` turns "1½ cups flour, sifted" into quantity, unit, name and note.
`units.ts` knows unit spellings and converts within volume and mass. The shopping
list (`lib/shopping/build.ts`) groups lines by a normalised name (`names.ts`:
lowercase, last word singular) plus the unit's dimension, so `200 g` and `0.5 kg`
add up, while `2 cans` and `3 tomatoes` stay separate.

## Shopping list

Generated per week from the plan and saved in `shopping_items`, so ticks survive.
Regenerating replaces only generated items; your own items and ticks stay. Items
that match the pantry are saved with `in_pantry = 1` and shown separately.

## Importing

- Markdown: `lib/markdown.ts`, the same format the export writes.
- Websites: `lib/jsonld.ts` reads schema.org `Recipe` data. Downloads go through
  `lib/fetchPage.ts`, which only allows public http(s) addresses.
- Backups: `lib/backup.ts`, JSON with a version number; restore runs in one
  transaction.
