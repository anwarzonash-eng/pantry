# pantry

A small self-hosted recipe box. Type recipes in plain text, and pantry understands the ingredient lines ("1½ cups flour", "2-3 cloves garlic, crushed"), so it can scale them and, soon, build a shopping list from a weekly meal plan.

Built with Next.js (App Router), TypeScript and SQLite (better-sqlite3). Everything is stored in one file under `data/`.

## Run it

Needs Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run seed       # optional: a few sample recipes
```

## What works so far

- Add, edit and delete recipes
- Ingredient lines are parsed into amount, unit, name and note (fractions, ½-style characters, ranges, "a pinch of")
- Tags, filter by tag, search by title or ingredient
- Readable URLs (`/recipes/chickpea-curry`) that stay the same when you rename a recipe

## Tests

```bash
npm test           # vitest
npm run typecheck
```
