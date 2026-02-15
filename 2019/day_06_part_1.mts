import { text } from "node:stream/consumers";

const orbits = new Map<string, string>(
  (await text(process.stdin))
    .trim()
    .split("\n")
    .map((v) => v.split(")").reverse() as [string, string]),
);

const objects = new Set(orbits.entries().toArray().flat());

console.log(
  objects
    .values()
    .map((value) => {
      let count = -1;
      do {
        count += 1;
        value = orbits.get(value);
      } while (value);
      return count;
    })
    .reduce((t, v) => t + v, 0),
);
