import { text } from "node:stream/consumers";

const range = (await text(process.stdin)).split("-").map(Number) as [
  number,
  number,
];

function* viable(from: number, to: number): Generator<Number> {
  outer: for (let i = from; i <= to; ++i) {
    let last = 0;
    let consecutiveGroups = Array(10).fill(0);
    for (const n of i.toString(10).split("").map(Number)) {
      if (n < last) {
        continue outer;
      }
      consecutiveGroups[n] += 1;
      last = n;
    }
    if (consecutiveGroups.some((c) => c === 2)) {
      yield i;
    }
  }
}

console.log([...viable(...range)].length);
