import { text } from "node:stream/consumers";

const data = await text(process.stdin);
let password = 0;
let dial = 50;
for (const line of data.split(/\n/)) {
  let distance = parseInt(line.slice(1));
  const direction = line[0];

  if (direction === "L") {
    distance *= -1;
  }
  dial += distance;
  dial %= 100;
  if (dial === 0) {
    password += 1;
  }
}
console.log(password);
