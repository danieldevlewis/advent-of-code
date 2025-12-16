import { text } from "node:stream/consumers";

const data = (await text(process.stdin))
  .trim()
  .split("\n")
  .map((line) => line.split(/\s+/).filter(Boolean))
  .reduce((t, row) => {
    for (const [i, value] of row.entries()) {
      t[i] ||= [];
      t[i].push(value);
    }
    return t;
  }, [])
  .map((row) => {
    const operator = row.pop();
    return row.map(Number).reduce((t, v) => {
      if (operator === "+") {
        return (t || 0) + v;
      }
      return (t || 1) * v;
    });
  })
  .reduce((t, v) => t + v, 0);

console.log(data);
