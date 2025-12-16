import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const ranges = [];
const ingredients = [];

data
  .trim()
  .split("\n")
  .forEach((line) => {
    if (line.includes("-")) {
      const [, start, end] = /(\d+)-?(\d+)/.exec(line);
      ranges.push([+start, +end]);
    } else if (line) {
      ingredients.push(+line);
    }
  });

let fresh = 0;

ingredients.forEach((id) => {
  if (ranges.some(([s, e]) => id >= s && id <= e)) {
    fresh += 1;
  }
});

console.log(fresh);
