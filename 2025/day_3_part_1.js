import { text } from "node:stream/consumers";

const data = await text(process.stdin);

let value = 0;
data.split("\n").forEach((bank) => {
  let ten = 0;
  let digit = 0;
  let index = 0;
  for (let i = 0; i < bank.length - 1; ++i) {
    const v = parseInt(bank[i]);
    if (v > ten) {
      ten = v;
      index = i;
    }
    if (ten === 9) {
      break;
    }
  }
  for (let i = index + 1; i < bank.length; ++i) {
    const v = parseInt(bank[i]);
    if (v > digit) {
      digit = v;
    }
  }
  value += parseInt(`${ten}${digit}`);
});
console.log(value);
