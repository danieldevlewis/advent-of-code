import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const grid = data
  .trim()
  .split("\n")
  .map((row) => row.split("").map((char) => char === "@"));

let total = 0;
let lastTotal = 0;
do {
  lastTotal = total;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) {
        return;
      }
      let count = 0;
      outer: for (let y1 of [-1, 0, 1]) {
        for (let x1 of [-1, 0, 1]) {
          if (x1 === 0 && y1 === 0) {
            continue;
          }
          if (grid[y1 + y]?.[x1 + x]) {
            count += 1;
          }
          if (count >= 4) {
            break outer;
          }
        }
      }
      if (count < 4) {
        total += 1;
        grid[y][x] = false;
      }
    });
  });
} while (total !== lastTotal);
console.log(total);
