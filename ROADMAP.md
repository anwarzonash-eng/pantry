# Roadmap

What comes after 1.0, roughly in order.

## Sharing a kitchen
- [ ] Optional login (one password or OIDC) for running it on the internet
- [ ] Several people on one instance, with a shared plan and list
- [ ] Live updates of the shopping list while two people shop (server-sent events)

## Recipes
- [ ] Upload photos instead of linking them, with thumbnails
- [ ] Ingredient-to-ingredient links ("see: pizza dough") between recipes
- [ ] Nutrition estimate from a small local ingredient table
- [ ] Rate a recipe after cooking it, and keep a cooking log with notes
- [ ] Better parser coverage: "1 lb 2 oz", "juice of 1 lemon", "salt, to taste" as optional
- [ ] Bulk import from a folder of Markdown files or another recipe app's export

## Plan and shopping
- [ ] Leftovers: plan one recipe across two meals without doubling the list
- [ ] Drag and drop in the week view
- [ ] Custom aisles and order per shop
- [ ] Pantry quantities and "running low" (not just have / do not have)
- [ ] Shopping list as a PWA that works offline in the shop

## Quality
- [ ] Playwright tests for the main flows (add recipe, plan, list, tick off)
- [ ] Accessibility pass with a screen reader
- [ ] Resolve hostnames before fetching for import, so DNS cannot point at private addresses
- [ ] Publish a Docker image from CI on tags
