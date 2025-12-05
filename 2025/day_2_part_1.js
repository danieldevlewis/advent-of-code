import { text } from "node:stream/consumers";

const data = await text(process.stdin);

let count = 0;

for (let line of data.split(/,/)) {
  line = line.trim();
  const [, start, end] = /(\d+)-(\d+)/.exec(line);

  for (let i = parseInt(start); i <= parseInt(end); ++i) {
    const str = String(i);
    const middle = str.length / 2;
    if (str.slice(0, middle) === str.slice(middle)) {
      count += i;
    }
  }
}

console.log(count);
