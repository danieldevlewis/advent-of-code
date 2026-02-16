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

const index = counts.indexOf(Math.max(...counts));
const [ax, ay] = asteroids[index];

const remainingAsterids = [...asteroids];
remainingAsterids.splice(index, 1);

const angles = [];

for (let y = 0; y < grid.length; y += 1) {
  for (let x = 0; x < grid[0].length; x += 1) {
    if (!grid[y][x]) {
      continue;
    }
    let angle: number;
    const v = [x - ax, y - ay];
    if (x >= ax && y < ay) {
      angle = Math.atan((x - ax) / (ay - y));
    } else if (x >= ax && y >= ay) {
      angle = Math.PI / 2 + Math.atan((y - ay) / (x - ax));
    } else if (x < ax && y >= ay) {
      angle = Math.PI + Math.atan((ax - x) / (y - ay));
    } else {
      angle = 3 * (Math.PI / 2) + Math.atan((ay - y) / (ax - x));
    }
    // [xcoord, ycoord, distance, angle (radians)]
    angles.push([x, y, Math.pow(v[0], 2) + Math.pow(v[1], 2), angle]);
  }
}

const grouped = Map.groupBy(angles, ([, , , angle]) => angle);
grouped.delete(NaN);
grouped.values().forEach((v) => v.sort(([, , a], [, , b]) => a - b));

const sorted = grouped
  .entries()
  .toArray()
  .sort(([a], [b]) => a - b);

let count = 1;
do {
  for (const [_, positions] of sorted) {
    for (const [x, y] of positions) {
      const index = remainingAsterids.findIndex(
        ([x1, y1]) => x1 === x && y1 === y,
      );
      if (index > -1) {
        if (count === 200) {
          console.log(x * 100 + y);
          process.exit();
        }
        count++;
        remainingAsterids.splice(index, 1);
        break;
      }
    }
  }
} while (remainingAsterids.length > 0);
