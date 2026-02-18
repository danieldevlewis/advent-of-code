import { text } from "node:stream/consumers";
import { combinations } from "../helpers.js";

const moons = (await text(process.stdin))
  .trim()
  .split("\n")
  .map((v) => /<x=(-?\d+), y=(-?\d+), z=(-?\d+)/.exec(v).slice(1).map(Number))
  .map((p) => [p, [0, 0, 0]]);

let count = 0;
do {
  combinations(moons, 2).forEach(([m1, m2]) => {
    for (let i = 0; i < 3; i += 1) {
      if (m1[0][i] === m2[0][i]) {
        continue;
      }
      if (m1[0][i] > m2[0][i]) {
        m1[1][i] -= 1;
        m2[1][i] += 1;
      } else {
        m1[1][i] += 1;
        m2[1][i] -= 1;
      }
    }
  });

  for (const m of moons) {
    for (let i = 0; i < 3; i += 1) {
      m[0][i] += m[1][i];
    }
  }
  count += 1;
} while (count < 1000);

console.log(
  moons
    .map(
      ([p, v]) =>
        p.map((x) => Math.abs(x)).reduce((t, x) => t + x, 0) *
        v.map((x) => Math.abs(x)).reduce((t, x) => t + x, 0),
    )
    .reduce((t, x) => t + x, 0),
);
