import { text } from "node:stream/consumers";
import highsPromise from "highs";

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

const highs = await highsPromise();

console.log(
  machines
    .map(({ buttons, joltages }) => {
      let problem = "Minimize\n obj: ";
      problem += buttons.map((_, i) => `x${i}`).join(" + ");
      problem += "\nSubject To\n";
      problem += joltages
        .map(
          (j, i) =>
            ` c${i + 1}: ` +
            buttons
              .map((b, bi) => (b.includes(i) ? `x${bi}` : null))
              .filter(Boolean)
              .join(" + ") +
            ` = ${j}`,
        )
        .join("\n");
      problem += "\nBounds\n";
      problem += buttons.map((_, i) => ` x${i} >= 0`).join("\n");
      problem += "\nGenerals\n";
      problem += buttons.map((_, i) => ` x${i}`).join(" ");
      problem += "\nEnd";

      return Object.entries(highs.solve(problem).Columns).reduce(
        (t, [, { Primal }]) => t + Primal,
        0,
      );
    })
    .reduce((t, v) => t + v, 0),
);
