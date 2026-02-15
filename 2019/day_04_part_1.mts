import { text } from "node:stream/consumers";

const range = (await text(process.stdin)).split("-").map(Number) as [
  number,
  number,
];

function* viable(from: number, to: number): Generator<Number> {
  outer: for (let i = from; i <= to; ++i) {
    let last = 0;
    let consecutive = false;
    for (const n of i.toString(10).split("").map(Number)) {
      if (n < last) {
        continue outer;
      }
      if (n === last) {
        consecutive = true;
      }
      last = n;
    }
    if (consecutive) {
      yield i;
    }
  }
}

console.log([...viable(...range)].length);
