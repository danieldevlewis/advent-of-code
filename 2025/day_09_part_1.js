import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const coords = data
  .trim()
  .split("\n")
  .map((line) => line.split(",").map(Number));

let max = 0;

for (let i = 0; i < coords.length; i += 1) {
  for (let j = i; j < coords.length; j += 1) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[j];

    const area = (Math.abs(x1 - x2) + 1) * (Math.abs(y1 - y2) + 1);

    if (area > max) {
      max = area;
    }
  }
}

console.log(max);
