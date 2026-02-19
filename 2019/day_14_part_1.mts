import { text } from "node:stream/consumers";

const recipes = new Map<string, [Map<string, number>, number]>(
  (await text(process.stdin))
    .trim()
    .split("\n")
    .map((v) => v.split(" => "))
    .map(
      ([input, output]) =>
        [
          output.split(" "),
          new Map<string, number>(
            input
              .split(/, /)
              .map((f) => f.split(" "))
              .map(([q, t]) => [t, Number(q)]),
          ),
        ] as [[string, string], Map<string, number>],
    )
    .map(([[q, t], m]) => [t, [m, Number(q)]]),
);

const orders = new Map<string, number>(recipes.keys().map((n) => [n, 0]));
orders.set("FUEL", 1);
orders.set("ORE", 0);

const pool = new Map<string, number>(recipes.keys().map((n) => [n, 0]));

do {
  // Find order
  const [name, amount] =
    orders.entries().find(([name, amount]) => name !== "ORE" && amount > 0) ||
    [];

  // No order - all fulfilled
  if (!name) {
    break;
  }

  // Take from pool first
  const take = Math.min(amount, pool.get(name));
  pool.set(name, pool.get(name) - take);
  let required = amount - take;

  // Remove order
  orders.set(name, 0);

  if (required === 0) {
    continue;
  }

  const [recipe, count] = recipes.get(name);
  // Min number of recipes
  const times = Math.ceil(required / count);

  // Place excess order in the pool
  if (times * count > required) {
    pool.set(name, pool.get(name) + (times * count - required));
  }

  // Create new orders
  for (const [ingredient, quanity] of recipe.entries()) {
    orders.set(ingredient, orders.get(ingredient) + quanity * times);
  }
} while (true);

console.log(orders.get("ORE"));
