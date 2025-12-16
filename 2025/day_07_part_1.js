import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const grid = [];
const beams = [];
data
  .trim()
  .split("\n")
  .forEach((line, y) => {
    for (const [x, cell] of line.split("").entries()) {
      grid[y] ||= [];
      grid[y][x] = cell;

      if (cell === "S") {
        beams.push([x, y]);
      }
    }
  });

function draw(grid) {
  for (const [, row] of grid.entries()) {
    for (const [, cell] of row.entries()) {
      process.stdout.write(cell || ".");
    }
    process.stdout.write("\n");
  }
  process.stdout.write("\n");
}

let count = 0;
do {
  let [x, y] = beams.shift();
  beam: do {
    y += 1;
    switch (grid[y]?.[x]) {
      case "^":
        count += 1;
        if (grid[y][x - 1]) {
          beams.push([x - 1, y]);
        }
        if (grid[y][x + 1]) {
          beams.push([x + 1, y]);
        }
        break beam;
      case ".":
        grid[y][x] = "|";
        break;
      case "|":
        break beam;
      default:
        break beam;
    }
  } while (true);
} while (beams.length > 0);

draw(grid);

console.log(count);
