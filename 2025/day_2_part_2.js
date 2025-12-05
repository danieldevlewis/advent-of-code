import { text } from "node:stream/consumers";

const data = await text(process.stdin);

let count = 0;

for (let line of data.split(/,/)) {
  line = line.trim();
  const [, start, end] = /(\d+)-(\d+)/.exec(line);

  for (let i = parseInt(start); i <= parseInt(end); ++i) {
    const str = String(i);
    const middle = str.length / 2;
    let chunk = "";
    for (let j = 0; j <= middle; j += 1) {
      chunk += str[j];
      if (new RegExp(`^(${chunk}){2,}$`).test(str)) {
        count += i;
        break;
      }
    }
  }
}

console.log(count);
