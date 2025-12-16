import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const grid = [];
let beams = [];
data
  .trim()
  .split("\n")
  .forEach((line, y) => {
    for (const [x, cell] of line.split("").entries()) {
      grid[y] ||= [];
      grid[y][x] = cell;

      if (cell === "S") {
        beams[x] = 1;
      }
    }
  });

let y = 0;
loop: do {
  y += 1;
  const newBeams = [];
  for (const [x, c] of beams.entries()) {
    if (!c) {
      continue;
    }
    if (!grid[y]) {
      break loop;
    }
    const v = grid[y][x];
    if (v === ".") {
      newBeams[x] ||= 0;
      newBeams[x] += c;
      continue;
    }
    if (v === "^") {
      newBeams[x - 1] ||= 0;
      newBeams[x - 1] += c;
      newBeams[x + 1] ||= 0;
      newBeams[x + 1] += c;
    }
  }
  beams = newBeams;
} while (true);

console.log(beams.reduce((c, v) => c + (v || 0), 0));
