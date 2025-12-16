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

for (let i = 0; i < connections.length; i += 1) {
  const [from, to] = connections[i];
  circuits[from].union(circuits[to]).forEach((key, _, s) => {
    circuits[key] = s;
  });

  if (new Set(circuits).size === 1) {
    console.log(boxes[from][0] * boxes[to][0]);
    break;
  }
}
