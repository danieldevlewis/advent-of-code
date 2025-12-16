import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const machines = [];

data
  .trim()
  .split("\n")
  .forEach((line) => {
    const [, indicators, buttons, joltages] = line.match(
      /^\[([.#]+)\] ([(\d), ]+) {(.*)}$/,
    );

    machines.push({
      indicators: indicators.split("").map((v) => v === "#"),
      buttons: buttons
        .split(" ")
        .map((v) => v.slice(1, -1).split(",").map(Number)),
      joltages: joltages.split(",").map(Number),
    });
  });

function* combinations(items, count) {
  if (count === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < items.length; i += 1) {
    for (const values of combinations(items.slice(i + 1), count - 1)) {
      yield [items[i], ...values];
    }
  }
}

function* repeatedCombinations(items, count) {
  if (count === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < items.length; i += 1) {
    for (const values of repeatedCombinations(items, count - 1)) {
      yield [items[i], ...values];
    }
  }
}

const presses = machines
  .map(({ indicators, buttons }) => {
    let i = 0;
    while ((i += 1)) {
      const possibilities = repeatedCombinations(buttons, i);
      for (const possibility of possibilities) {
        const state = Array(indicators.length).fill(false);
        possibility.forEach((presses) => {
          presses.forEach((i) => {
            state[i] = !state[i];
          });
        });
        if (state.every((v, i) => v === indicators[i])) {
          return possibility.length;
        }
      }
    }
  })
  .reduce((t, v) => t + v, 0);

console.log(presses);
