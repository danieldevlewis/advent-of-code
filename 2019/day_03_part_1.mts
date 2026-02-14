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

// Method 1 - mark each square on a map
const grid: Map<string, boolean[]> = new Map();
for (const [index, wire] of wires.entries()) {
  for (const [[x1, y1], [x2, y2]] of wire) {
    if (x1 === x2) {
      if (y1 < y2) {
        for (let i = y1; i < y2; i++) {
          if (!grid.has(`${x1},${i}`)) {
            grid.set(`${x1},${i}`, []);
          }
          grid.get(`${x1},${i}`)[index] = true;
        }
      } else {
        for (let i = y2; i < y1; i++) {
          if (!grid.has(`${x1},${i}`)) {
            grid.set(`${x1},${i}`, []);
          }
          grid.get(`${x1},${i}`)[index] = true;
        }
      }
    } else {
      if (x1 < x2) {
        for (let i = x1; i < x2; i++) {
          if (!grid.has(`${i},${y1}`)) {
            grid.set(`${i},${y1}`, []);
          }
          grid.get(`${i},${y1}`)[index] = true;
        }
      } else {
        for (let i = x2; i < x1; i++) {
          if (!grid.has(`${i},${y1}`)) {
            grid.set(`${i},${y1}`, []);
          }
          grid.get(`${i},${y1}`)[index] = true;
        }
      }
    }
  }
}

grid.delete("0,0");

console.log(
  Math.min(
    ...grid
      .entries()
      .filter(([_, [x, y]]) => x && y)
      .map(([k]) =>
        k
          .split(",")
          .map(Number)
          .reduce((t, v) => t + Math.abs(v), 0),
      ),
  ),
);

// Method 2 - compare lines
const crossings = [];
for (let [[xa1, ya1], [xa2, ya2]] of wires[0]) {
  for (let [[xb1, yb1], [xb2, yb2]] of wires[1]) {
    [xa1, xa2] = [xa1, xa2].sort((a, b) => a - b);
    [xb1, xb2] = [xb1, xb2].sort((a, b) => a - b);
    [ya1, ya2] = [ya1, ya2].sort((a, b) => a - b);
    [yb1, yb2] = [yb1, yb2].sort((a, b) => a - b);
    if (
      xa1 === xa2 &&
      xb1 <= xa1 &&
      xb2 >= xa1 &&
      yb1 === yb2 &&
      ya1 <= yb1 &&
      ya2 >= yb1
    ) {
      crossings.push([xa1, yb1]);
    } else if (
      ya1 === ya2 &&
      yb1 <= ya1 &&
      yb2 >= ya1 &&
      xb1 === xb2 &&
      xa1 <= xb1 &&
      xa2 >= xb1
    ) {
      crossings.push([xb1, ya1]);
    } else if (ya1 === ya2 && yb1 === yb2 && ya1 === yb1) {
      if (xa1 === xb1 || xa1 === xb2) {
        crossings.push([xa1, ya1]);
      } else if (xa2 === xb1 || xa2 === xb2) {
        crossings.push([xa2, ya1]);
      }
    } else if (xa1 === xa2 && xb1 === xb2 && xa1 === xb1) {
      if (ya1 === yb1 || ya1 === yb2) {
        crossings.push([xa1, ya1]);
      } else if (ya2 === yb1 || ya2 === yb2) {
        crossings.push([xa1, ya2]);
      }
    }
  }
}

console.log(
  Math.min(...crossings.slice(1).map(([x, y]) => Math.abs(x) + Math.abs(y))),
);
