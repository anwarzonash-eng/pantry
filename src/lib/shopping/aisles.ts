/** Rough supermarket sections, in the order you walk through a typical shop. */
export const AISLES = [
  "Fruit & veg",
  "Bakery",
  "Meat & fish",
  "Dairy & eggs",
  "Dry goods",
  "Tins & jars",
  "Spices & baking",
  "Frozen",
  "Drinks",
  "Household",
  "Other",
] as const;
export type Aisle = (typeof AISLES)[number];

// checked in order, first match wins, so "coconut milk" is a tin before "milk" is dairy
const KEYWORDS: [Aisle, string[]][] = [
  ["Tins & jars", ["canned", "tinned", "coconut milk", "chopped tomatoes", "passata", "tomato paste", "stock cube", "chickpeas", "beans", "tahini", "peanut butter", "jam", "honey", "olives", "capers", "pesto", "soy sauce", "mustard", "vinegar", "ketchup"]],
  ["Spices & baking", ["salt", "pepper", "cumin", "paprika", "turmeric", "curry powder", "chili flakes", "chilli flakes", "oregano", "cinnamon", "nutmeg", "baking powder", "baking soda", "yeast", "vanilla", "sugar", "cocoa", "dried"]],
  ["Frozen", ["frozen", "ice cream", "peas"]],
  ["Meat & fish", ["chicken", "beef", "pork", "lamb", "mince", "bacon", "sausage", "ham", "turkey", "salmon", "tuna", "cod", "prawn", "shrimp", "fish"]],
  ["Dairy & eggs", ["milk", "butter", "cheese", "cheddar", "parmesan", "mozzarella", "feta", "yogurt", "yoghurt", "cream", "egg"]],
  ["Bakery", ["bread", "baguette", "tortilla", "wrap", "pita", "bun", "roll", "croissant"]],
  ["Dry goods", ["flour", "rice", "pasta", "spaghetti", "penne", "noodle", "oat", "lentil", "quinoa", "couscous", "cereal", "cracker", "nut", "almond", "seed", "oil"]],
  ["Drinks", ["juice", "coffee", "tea", "wine", "beer", "water"]],
  ["Household", ["soap", "detergent", "foil", "paper", "bin bag", "sponge"]],
  ["Fruit & veg", ["onion", "garlic", "shallot", "leek", "carrot", "potato", "tomato", "pepper", "chili", "chilli", "spinach", "lettuce", "kale", "cabbage", "broccoli", "cauliflower", "courgette", "zucchini", "aubergine", "eggplant", "mushroom", "celery", "cucumber", "avocado", "lemon", "lime", "orange", "apple", "banana", "berr", "grape", "ginger", "herb", "basil", "parsley", "coriander", "cilantro", "mint", "thyme", "rosemary", "squash", "pumpkin", "corn", "bean sprout"]],
];

export function aisleFor(name: string): Aisle {
  const text = ` ${name.toLowerCase()} `;
  for (const [aisle, words] of KEYWORDS) {
    if (words.some((w) => text.includes(w))) return aisle;
  }
  return "Other";
}

/** Items grouped by aisle, aisles in shop order, empty ones left out. */
export function groupByAisle<T extends { name: string }>(items: T[]): { aisle: Aisle; items: T[] }[] {
  const groups = new Map<Aisle, T[]>();
  for (const item of items) {
    const aisle = aisleFor(item.name);
    groups.set(aisle, [...(groups.get(aisle) ?? []), item]);
  }
  return AISLES.filter((a) => groups.has(a)).map((aisle) => ({ aisle, items: groups.get(aisle)! }));
}
