import { text } from "node:stream/consumers";

const input = (await text(process.stdin)).trim().split("").map(Number);

function* pattern(count: number): Generator<number, never> {
  const base = [0, 1, 0, -1];

  let i = 1;
  let j = 0;
  do {
    if (Math.floor(i / (count + 1)) > j) {
      j += 1;
    }
    i += 1;
    yield base[j % base.length];
  } while (true);
}

let phase = 0;
let current = [...input];
do {
  const result = Array<number[]>(input.length)
    .fill(current)
    .map((v, i) => {
      const p = pattern(i);
      return v
        .map((a) => {
          const m = p.next().value;
          return a * m;
        })
        .reduce((t, a) => t + a, 0);
    })
    .map((v) => v.toString().at(-1))
    .map(Number);

  current = [...result];
  phase += 1;
} while (phase < 100);

console.log(current.slice(0, 8).join(""));
