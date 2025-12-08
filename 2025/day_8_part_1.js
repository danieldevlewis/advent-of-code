import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const boxes = data
  .trim()
  .split("\n")
  .map((v) => v.split(",").map(Number));

const connections = [];

for (const [i, b1] of boxes.entries()) {
  for (const [j, b2] of boxes.entries()) {
    if (j <= i) {
      continue;
    }

    connections.push([
      i,
      j,
      Math.sqrt(b1.reduce((t, v, i) => t + Math.pow(v - b2[i], 2), 0)),
    ]);
  }
}
connections.sort((a, b) => a[2] - b[2]);

const circuits = boxes.map((_, i) => new Set([i]));

connections
  .slice(0, circuits.length > 100 ? 1000 : 10)
  .forEach(([from, to]) => {
    circuits[from].union(circuits[to]).forEach((key, _, s) => {
      circuits[key] = s;
    });
  });

console.log(
  [...new Set(circuits)]
    .sort((a, b) => b.size - a.size)
    .slice(0, 3)
    .reduce((t, s) => t * s.size, 1),
);
