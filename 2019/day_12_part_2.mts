import { text } from "node:stream/consumers";
import { combinations, leastCommonMultiple } from "../helpers.js";

const moons = (await text(process.stdin))
  .trim()
  .split("\n")
  .map((v) => /<x=(-?\d+), y=(-?\d+), z=(-?\d+)/.exec(v).slice(1).map(Number))
  .map((p) => [p, [0, 0, 0]]) as [number[], number[]][];

function simulateAxis(initial: [number[], number[]][], axis: number): number {
  const moons = initial.map(([p, v]) => [[...p], [...v]]);
  let count = 0;
  do {
    count += 1;
    combinations(moons, 2).forEach(([m1, m2]) => {
      if (m1[0][axis] === m2[0][axis]) {
        return;
      }
      if (m1[0][axis] > m2[0][axis]) {
        m1[1][axis] -= 1;
        m2[1][axis] += 1;
      } else {
        m1[1][axis] += 1;
        m2[1][axis] -= 1;
      }
    });

    for (const m of moons) {
      m[0][axis] += m[1][axis];
    }
    if (
      moons.every(
        ([p, v], i) => p[axis] === initial[i][0][axis] && v[axis] === 0,
      )
    ) {
      return count;
    }
  } while (true);
}

console.log(leastCommonMultiple([0, 1, 2].map((i) => simulateAxis(moons, i))));
