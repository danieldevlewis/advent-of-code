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

// 1. Find largest button to press
// 2. Press most times possible
// 3. Find next largest p

function* solve(
  [button, ...buttons],
  joltages,
  currentJoltage = Array(joltages.length).fill(0),
  presses = 0,
  iterations = { current: 0 },
  best = { current: Infinity },
) {
  iterations.current += 1;
  if (iterations.current > 10000000) {
    return;
  }
  const maxPresses = Math.min(
    ...button.map((i) => joltages[i] - currentJoltage[i]),
  );
  if (buttons.length === 0) {
    // Last button - only one try
    if (maxPresses > 0) {
      if (presses + maxPresses >= best.current) {
        return;
      }
      const newJoltage = currentJoltage.map((v, i) => {
        if (button.includes(i)) {
          return v + maxPresses;
        }
        return v;
      });
      if (joltages.every((v, i) => newJoltage[i] === v)) {
        if (presses + maxPresses < best.current) {
          best.current = presses + maxPresses;
        }
        yield presses + maxPresses;
      }
    }
    return;
  }
  for (let p = maxPresses; p >= 0; p -= 1) {
    let newJoltage = currentJoltage;
    if (p > 0) {
      if (presses + p >= best.current) {
        continue;
      }
      newJoltage = currentJoltage.map((v, i) => {
        if (button.includes(i)) {
          return v + p;
        }
        return v;
      });
      if (joltages.every((v, i) => newJoltage[i] === v)) {
        if (presses + p < best.current) {
          best.current = presses + p;
        }
        yield presses + p;
        break;
      }
    }

    // calculate remaining buttons
    // calculate unfulfilled joltages
    // return if impossible
    if (
      !joltages.every(
        (j, i) => newJoltage[i] === j || buttons.some((b) => b.includes(i)),
      )
    ) {
      return;
    }

    yield* solve(buttons, joltages, newJoltage, presses + p, iterations, best);
  }
}

console.log(
  machines
    .map(({ buttons, joltages }, index) => {
      buttons = buttons
        .map((b) => [
          [b.length, ...b.map((v) => joltages[v]).sort((a, b) => b - a)],
          b,
        ])
        .toSorted(([b1], [b2]) => {
          for (let i = 0; i < b1.length; i += 1) {
            if (b1[i] !== b2[i]) {
              return b2[i] - b1[i];
            }
          }
          return 0;
        })
        .map(([, b]) => b);
      for (const presses of solve(buttons, joltages)) {
        console.log(index, presses);
        return presses;
      }
      buttons = buttons
        .map((b) => [[...b.map((v) => joltages[v]).sort((a, b) => a - b)], b])
        .toSorted(([b1], [b2]) => {
          for (let i = 0; i < b1.length; i += 1) {
            if (b1[i] !== b2[i]) {
              return b1[i] - b2[i];
            }
          }
          return 0;
        })
        .map(([, b]) => b);
      let found = [];
      for (const presses of solve(buttons, joltages)) {
        console.log(index, presses);
        found.push(presses);
      }
      if (found.length) {
        console.log(index, Math.min(...found));
        return Math.min(...found);
      }
      buttons = buttons
        .map((b) => [
          [
            ...b
              .map((v) => buttons.filter((sb) => sb.includes(v).length))
              .sort((a, b) => a - b),
          ],
          b,
        ])
        .toSorted(([b1], [b2]) => {
          for (let i = 0; i < b1.length; i += 1) {
            if (b1[i] !== b2[i]) {
              return b1[i] - b2[i];
            }
          }
          return 0;
        })
        .map(([, b]) => b);
      for (const presses of solve(buttons, joltages)) {
        console.log(index, presses);
        found.push(presses);
      }
      if (found.length) {
        console.log(index, Math.min(...found));
        return Math.min(...found);
      }
      let count = 0;
      do {
        count += 1;
        buttons = buttons
          .map((b) => [Math.random(), b])
          .toSorted(([a], [b]) => a - b)
          .map(([, b]) => b);
        for (const presses of solve(buttons, joltages)) {
          console.log(index, presses);
          found.push(presses);
        }
        if (found.length) {
          console.log(index, Math.min(...found));
          return Math.min(...found);
        }
      } while (count < 1000);
      console.log(index, "failed");
    })
    .reduce((t, v) => t + v, 0),
);
