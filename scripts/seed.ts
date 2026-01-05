// Fill an empty database with a few sample recipes: npm run seed
import { getDb } from "../src/lib/db";
import { createRecipe, listRecipes, type RecipeInput } from "../src/lib/recipes";

const SAMPLES: RecipeInput[] = [
  {
    title: "Weeknight Tomato Pasta",
    description: "Pantry staples, twenty minutes.",
    servings: 2,
    tags: ["dinner", "quick", "vegetarian"],
    ingredients: [
      "200 g spaghetti",
      "2 tbsp olive oil",
      "3 cloves garlic, thinly sliced",
      "1 (400 g) can chopped tomatoes",
      "½ tsp chili flakes",
      "a handful of basil leaves",
      "salt and pepper",
    ],
    steps: [
      "Cook the spaghetti in well salted water.",
      "Warm the oil and garlic in a pan over low heat until the garlic is golden.",
      "Add the tomatoes and chili, simmer for 10 minutes.",
      "Toss with the drained pasta and a splash of pasta water. Finish with basil.",
    ],
  },
  {
    title: "Chickpea Coconut Curry",
    description: "Mild, creamy and better the next day.",
    servings: 4,
    tags: ["dinner", "vegetarian"],
    ingredients: [
      "1 tbsp vegetable oil",
      "1 onion, diced",
      "2 cloves garlic, crushed",
      "1 tbsp curry powder",
      "2 (400 g) cans chickpeas, drained",
      "1 (400 ml) can coconut milk",
      "200 g spinach",
      "1 lime",
    ],
    steps: [
      "Soften the onion in the oil for 8 minutes.",
      "Stir in garlic and curry powder for a minute.",
      "Add chickpeas and coconut milk, simmer 15 minutes.",
      "Wilt in the spinach and squeeze over the lime.",
    ],
  },
  {
    title: "Overnight Oats",
    servings: 1,
    tags: ["breakfast", "quick"],
    ingredients: ["½ cup rolled oats", "½ cup milk", "¼ cup yogurt", "1 tsp honey", "a pinch of cinnamon"],
    steps: ["Stir everything together in a jar.", "Leave in the fridge overnight."],
  },
  {
    title: "Red Lentil Soup",
    servings: 4,
    tags: ["lunch", "vegetarian"],
    ingredients: [
      "1 cup red lentils, rinsed",
      "1 onion, diced",
      "1 carrot, diced",
      "1 l vegetable stock",
      "1 tsp ground cumin",
      "1 lemon",
    ],
    steps: [
      "Cook onion and carrot until soft.",
      "Add lentils, stock and cumin. Simmer 20 minutes.",
      "Blend until smooth and add lemon juice to taste.",
    ],
  },
  {
    title: "Lemon Chicken Traybake",
    servings: 4,
    tags: ["dinner"],
    ingredients: [
      "8 chicken thighs",
      "600 g small potatoes, halved",
      "1 lemon, cut into wedges",
      "3 cloves garlic",
      "2 tbsp olive oil",
      "1 tsp dried oregano",
    ],
    steps: [
      "Heat the oven to 200°C.",
      "Toss everything in a roasting tin and season well.",
      "Roast for 45 minutes, turning the potatoes once.",
    ],
  },
  {
    title: "Banana Pancakes",
    servings: 2,
    tags: ["breakfast"],
    ingredients: ["1 ripe banana", "2 eggs", "½ cup flour", "½ tsp baking powder", "1 tbsp butter"],
    steps: ["Mash the banana and whisk in the eggs.", "Stir in flour and baking powder.", "Fry small pancakes in the butter."],
  },
];

const db = getDb();
if (listRecipes(db).length > 0) {
  console.log("database already has recipes, not seeding");
} else {
  for (const recipe of SAMPLES) createRecipe(db, recipe);
  console.log(`added ${SAMPLES.length} sample recipes`);
}
