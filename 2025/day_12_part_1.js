import { text } from "node:stream/consumers";

const data = await text(process.stdin);
const shapes = [];
const trees = [];

let currentShape;
data
  .trim()
  .split("\n")
  .forEach((line) => {
    let m;
    if (line.match(/^\d:/)) {
      currentShape = [];
      shapes.push(currentShape);
    } else if (line.match(/[.#]/)) {
      currentShape.push(line);
    } else if ((m = line.match(/^(\d+x\d+): (.*)/))) {
      trees.push({
        size: m[1].split("x").map(Number),
        counts: m[2].split(" ").map(Number),
      });
    }
  });

console.log(
  trees.filter(({ size: [x, y], counts }) => {
    const total = counts.reduce((t, v) => t + v, 0);
    const volume = Math.floor(x / 3) * Math.floor(y / 3);
    let possible;
    if (volume >= total) {
      possible = true;
    }
    return possible;
  }).length,
);
