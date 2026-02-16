import { text } from "node:stream/consumers";

const grid = (await text(process.stdin))
  .trim()
  .split("\n")
  .map((v) => v.split("").map((c) => c === "#"));

const asteroids = grid
  .flatMap((row, y) => row.map((v, x) => [v, [x, y]]))
  .filter(([v]) => v)
  .map(([_, coords]) => coords) as [number, number][];

function largestFactor(numbers: number[]): number | null {
  for (let i = Math.max(...numbers.map(Math.abs)); i > 1; i -= 1) {
    if (numbers.every((v) => v % i === 0)) {
      return i;
    }
  }
  return 1;
}

const counts = [];
for (const [index, [x1, y1]] of asteroids.entries()) {
  asteroid: for (const [x2, y2] of asteroids) {
    if (x1 === x2 && y1 === y2) {
      continue;
    }
    let v = [x2 - x1, y2 - y1];
    const factor = largestFactor(v);
    v = v.map((c) => c / factor);
    if (factor > 1) {
      for (let i = 1; i < factor; i += 1) {
        const d = v.map((c) => c * i);
        if (grid[y1 + d[1]][x1 + d[0]]) {
          continue asteroid;
        }
      }
    }
    counts[index] ||= 0;
    counts[index] += 1;
  }
}

console.log(Math.max(...counts));
