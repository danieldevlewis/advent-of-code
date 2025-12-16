import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const ranges = [];

data
  .trim()
  .split("\n")
  .forEach((line) => {
    if (line.includes("-")) {
      const [, start, end] = /(\d+)-?(\d+)/.exec(line);
      ranges.push([+start, +end]);
    }
  });

for (const range of ranges) {
  const within = ranges.find((r) => {
    if (r === range) {
      return false;
    }
    return (
      (r[0] >= range[0] && r[0] <= range[1]) ||
      (r[1] >= range[0] && r[1] <= range[1])
    );
  });
  if (within) {
    within[0] = Math.min(within[0], range[0]);
    within[1] = Math.max(within[1], range[1]);
    range[0] = 0;
    range[1] = 0;
  }
}

console.log(
  ranges
    .map(([s, e]) => {
      if (s === 0 && e === 0) {
        return 0;
      }
      return e - s + 1;
    })
    .reduce((t, v) => v + t, 0),
);
