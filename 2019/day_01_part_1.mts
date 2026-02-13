import { text } from "node:stream/consumers";

console.log(
  (await text(process.stdin))
    .trim()
    .split("\n")
    .map((d) => parseInt(d, 10))
    .map((d) => Math.floor(d / 3) - 2)
    .reduce((t, v) => t + v, 0),
);
