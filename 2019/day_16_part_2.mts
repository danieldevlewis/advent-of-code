import { text } from "node:stream/consumers";

// I spent far too long trying to calculate the entire space
// using some flawed reasoning, before finally having a look
// for a hint on reddit and realising I hadn't investigated
// the offset properly
//
// The offset is near the end meaning only the 1's are involved
// It sufficient to just add all the numbers beyond the offset
// And if you start at the end you can cache the previous additions
//
// It is still a bit slow

const input = (await text(process.stdin)).trim().split("").map(Number);
const offset = Number(input.slice(0, 7).join(""));

let current = [];
for (let i = 0; i < 10000; i += 1) {
  current.push(...input);
}
current.splice(0, offset);
const currentLength = current.length;

let phase = 0;
do {
  const result = [];
  let total = 0;
  for (let i = currentLength - 1; i >= 0; i -= 1) {
    total += current[i];
    result[i] = Number(total.toString().at(-1));
  }

  current = [...result];
  phase += 1;
} while (phase < 100);

console.log(current.slice(0, 8).join(""));
