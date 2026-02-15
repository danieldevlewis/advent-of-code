import { text } from "node:stream/consumers";
import { eachSlice } from "../helpers.js";

const data = (await text(process.stdin)).trim().split("").map(Number);

const width = 25;
const height = 6;

const layers = eachSlice(data, width * height)
  .map((layer) => eachSlice(layer, width).toArray())
  .toArray();

for (let h = 0; h < height; h += 1) {
  image: for (let w = 0; w < width; w += 1) {
    for (const layer of layers) {
      if (layer[h][w] === 0) {
        process.stdout.write(" ");
        continue image;
      }
      if (layer[h][w] === 1) {
        process.stdout.write("X");
        continue image;
      }
    }
    process.stdout.write(" ");
  }
  process.stdout.write("\n");
}
