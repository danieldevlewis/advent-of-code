import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const coords = data
  .trim()
  .split("\n")
  .map((line) => line.split(",").map(Number));

const cache = new Map();

function inside(x, y) {
  if (cache.has(`${x}-${y}`)) {
    return cache.get(`${x}-${y}`);
  }
  let crossing = 0;
  for (let i = 0; i < coords.length; i += 1) {
    let [x1, y1] = coords[i];
    let [x2, y2] = coords[(i + 1) % coords.length];

    if (
      (y1 < y2 ? y1 <= y && y2 >= y : y2 <= y && y1 >= y) &&
      (x1 < x2 ? x1 <= x && x2 >= x : x2 <= x && x1 >= x)
    ) {
      cache.set(`${x}-${y}`, true);
      return true;
    }

    if (
      (y1 < y2 ? y1 < y && y2 >= y : y2 < y && y1 >= y) &&
      x1 <= x &&
      x2 <= x
    ) {
      crossing += 1;
    }
  }
  cache.set(`${x}-${y}`, crossing % 2 === 1);
  return crossing % 2 === 1;
}

// function draw(...mark) {
//   const maxY = Math.max(...coords.map(([, y]) => y));
//   const maxX = Math.max(...coords.map(([x]) => x));
//   for (let y = 0; y <= maxY + 1; y += 1) {
//     for (let x = 0; x <= maxX + 1; x += 1) {
//       if (mark.some(([x1, y1]) => x1 === x && y1 === y)) {
//         process.stdout.write("0");
//       } else if (coords.some(([x1, y1]) => x1 === x && y1 === y)) {
//         process.stdout.write("#");
//       } else {
//         process.stdout.write(inside(x, y) ? "X" : ".");
//       }
//     }
//     process.stdout.write("\n");
//   }
// }

const rects = [];

for (let i = 0; i < coords.length; i += 1) {
  for (let j = i + 1; j < coords.length; j += 1) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[j];

    if (inside(x2, y1) && inside(x1, y2)) {
      const area = (Math.abs(x1 - x2) + 1) * (Math.abs(y1 - y2) + 1);
      rects.push([[x1, y1], [x2, y2], area]);
    }
  }
}

rects.sort(([, , s1], [, , s2]) => s2 - s1);

console.log(rects);

loop: for (const [[x1, y1], [x2, y2], size] of rects) {
  console.log("try", [x1, y1], [x2, y2], size);
  const [xmin, xmax] = [x1, x2].sort((a, b) => a - b);
  const [ymin, ymax] = [y1, y2].sort((a, b) => a - b);

  if (coords.some(([x, y]) => xmin < x && xmax > x && ymin < y && ymax > y)) {
    continue loop;
  }
  for (let x = xmin; x <= xmax; x += 1) {
    if (!inside(x, ymin) || !inside(x, ymax)) {
      continue loop;
    }
  }
  for (let y = ymin; y <= ymax; y += 1) {
    if (!inside(xmin, y) || !inside(xmax, y)) {
      continue loop;
    }
  }
  // draw([x1, y1], [x2, y2]);
  console.log(size);
  break;
}
