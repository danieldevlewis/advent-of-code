import { text } from "node:stream/consumers";

const wires = (await text(process.stdin))
  .trim()
  .split("\n")
  .map((w) => w.split(",").map((m) => [m[0], Number(m.slice(1))]))
  .map((instructions) => {
    const segments = [];
    let current = [0, 0];
    for (const [direction, distance] of instructions as [string, number][]) {
      let newPosition: [number, number];
      switch (direction) {
        case "L":
          newPosition = [current[0] - distance, current[1]];
          break;
        case "D":
          newPosition = [current[0], current[1] - distance];
          break;
        case "R":
          newPosition = [current[0] + distance, current[1]];
          break;
        case "U":
          newPosition = [current[0], current[1] + distance];
          break;
      }
      segments.push([current, newPosition]);
      current = newPosition;
    }
    return segments;
  });

function* positions(
  wire: [[number, number], [number, number]][],
): Generator<[number, number]> {
  yield wire[0][0];
  for (const [[x1, y1], [x2, y2]] of wire) {
    if (x1 === x2) {
      if (y1 < y2) {
        for (let i = y1 + 1; i <= y2; i++) {
          yield [x1, i];
        }
      } else {
        for (let i = y1 - 1; i >= y2; i--) {
          yield [x1, i];
        }
      }
    }
    if (y1 === y2) {
      if (x1 < x2) {
        for (let i = x1 + 1; i <= x2; i++) {
          yield [i, y1];
        }
      } else {
        for (let i = x1 - 1; i >= x2; i--) {
          yield [i, y1];
        }
      }
    }
  }
}

const intersections = new Map<string, [number?, number?]>();

for (const [i, wire] of wires.entries()) {
  positions(wire).forEach(([x, y], count) => {
    const key = `${x},${y}`;
    if (!intersections.has(key)) {
      intersections.set(key, []);
    }
    intersections.get(key)[i] ||= count;
  });
}

console.log(
  Math.min(
    ...intersections
      .values()
      .filter(([a, b]) => a && b)
      .map(([a, b]) => a + b),
  ),
);
