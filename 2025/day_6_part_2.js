import { text } from "node:stream/consumers";

const lines = (await text(process.stdin)).trim().split("\n");

function calculate(operator, values) {
  if (operator === "+") {
    return values.reduce((t, v) => t + v, 0);
  }
  return values.reduce((t, v) => t * v, 1);
}

const length = Math.max(...lines.map((l) => l.length));

let total = 0;
let values;
let operator;
for (let i = 0; i < length; ++i) {
  const char = lines.at(-1)[i];
  if (char?.trim()) {
    if (operator) {
      total += calculate(operator, values);
    }
    operator = char.trim();
    values = [];
  }
  let value = "";
  for (let y = 0; y < lines.length - 1; ++y) {
    value += lines[y][i].trim();
  }
  if (value) {
    values.push(parseInt(value));
  }
}
total += calculate(operator, values);
console.log(total);
