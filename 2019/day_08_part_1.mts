import { text } from "node:stream/consumers";
import { eachSlice, tally, minBy } from "../helpers.js";

const image = (await text(process.stdin)).trim().split("").map(Number);

const width = 25;
const height = 6;

const layers: Generator<number[]> = eachSlice(image, width * height);
const min = minBy(layers, (v) => {
  const count = v.filter((x: number) => x === 0).length;
  return count === 0 ? Infinity : count;
});
const counts = tally(min);
console.log(counts.get(1) * counts.get(2));
