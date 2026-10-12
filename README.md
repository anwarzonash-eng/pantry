# pantry

A self-hosted recipe box with a weekly meal plan and a shopping list that writes itself.

You type recipes the way you would on paper. pantry understands the ingredient lines ("1½ cups flour", "2-3 cloves garlic, crushed", "1 (400 g) can tomatoes"), so it can scale them, convert units, and add up everything the week's meals need into one list, grouped by supermarket aisle, minus what is already in your pantry.

It is for home cooks who want their recipes in one private place they control, without an account or an app store. One Next.js app, one SQLite file, runs on a laptop, a Raspberry Pi or a small server.

Built with Next.js 16 (App Router, server actions), React 19, TypeScript and SQLite through better-sqlite3. Tested with Vitest.

## Run it

Needs Node.js 20 or newer.

```bash
git clone https://github.com/anwarzonash-eng/pantry.git
cd pantry
npm install
npm run dev        # http://localhost:3000
npm run seed       # optional: six sample recipes to try it with
```

For everyday use:

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t pantry .
docker run -d -p 3000:3000 -v pantry-data:/app/data pantry
```

### Data and backups

Everything is in `data/pantry.db` (set `DATA_DIR` to put it elsewhere, see `.env.example`).

- **Import → Download a backup** gives you one JSON file with all recipes, the plan and the pantry; the same page restores it.
- `npm run backup` writes a dated backup to `backups/` and keeps the last 14, for cron.

pantry has no login. Run it on your own machine or home network, or put it behind a reverse proxy with authentication if it is reachable from the internet.

## Features

**Recipes**
- Plain-text ingredients and steps, with headings inside the list ("For the sauce:")
- Ingredient parsing: whole numbers, decimals, fractions, ½-style characters, ranges, "a pinch of", sizes in brackets
- Servings control that scales every amount, shown as ½ ⅓ ¼ where it reads better
- Metric or US units, converted on the fly (spoons are left alone)
- Tags, favourites, notes, source link, photo, prep and cook time
- Search by title, description or ingredient (accents ignored), sort by recent, A–Z or quickest
- Cook mode: one step at a time in large text, keeps the screen awake
- Print layout, duplicate, Markdown export

**Week plan**
- Breakfast, lunch and dinner for each day, with optional servings per meal
- Copy last week, dinner ideas you have not had in a while, printable

**Shopping list**
- Made from the plan: amounts of the same ingredient add up across recipes and units (200 g + 0.5 kg = 700 g; "tomato" and "tomatoes" are the same)
- Grouped by aisle, tick items off on your phone, add your own, copy as text
- Pantry items are left off; ticked items can be put into the pantry

**Import**
- Markdown (the same format the export writes)
- A recipe website link or its page source, using the schema.org data most recipe sites publish
- JSON backups

## Development

```bash
npm test           # vitest
npm run typecheck
npm run build
```

The logic lives in `src/lib` with no framework imports and is tested against an in-memory SQLite database. See [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Roadmap

Logins for internet-facing installs, photo uploads, leftovers in the plan and an offline shopping list are next. See [ROADMAP.md](ROADMAP.md) and [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
