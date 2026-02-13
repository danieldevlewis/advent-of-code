import { text } from "node:stream/consumers";

console.log(
  (await text(process.stdin))
    .trim()
    .split("\n")
    .map((d) => parseInt(d, 10))
    .map((d) => Math.floor(d / 3) - 2)
    .map((d) => {
      let fuel = d;
      let totalFuel = 0;
      do {
        fuel = Math.max(0, Math.floor(fuel / 3) - 2);
        totalFuel += fuel;
      } while (fuel > 0);
      return totalFuel + d;
    })
    .reduce((t, v) => t + v, 0),
);
