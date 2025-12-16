import { text } from "node:stream/consumers";

const data = await text(process.stdin);

let value = 0;
data
  .trim()
  .split("\n")
  .forEach((bank) => {
    let digits = Array(12).fill(0);

    let index = 0;
    for (let d = 0; d < 12; ++d) {
      for (let i = index; i < bank.length - 11 + d; ++i) {
        const v = parseInt(bank[i]);
        if (v > digits[d]) {
          digits[d] = v;
          index = i + 1;
        }
        if (digits[d] === 9) {
          break;
        }
      }
    }
    value += parseInt(digits.join(""));
  });
console.log(value);
