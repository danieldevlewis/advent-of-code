import { text } from "node:stream/consumers";

const ints = (await text(process.stdin))
  .split(",")
  .map((v) => v.trim())
  .map(Number);
const inputs = [5];
const outputs = [];

function value(i: number, mode: string) {
  let v = ints[i];
  if (mode === "0") {
    v = ints[v];
  }
  return v;
}

loop: for (let i = 0; i < ints.length; ) {
  const [_cmode, bmode, amode, ...opcode] = ints[i]
    .toString()
    .padStart(5, "0")
    .split("");

  switch (parseInt(opcode.join(""), 10)) {
    case 99:
      break loop;
    case 1:
      ints[ints[i + 3]] = value(i + 1, amode) + value(i + 2, bmode);
      i += 4;
      break;
    case 2:
      ints[ints[i + 3]] = value(i + 1, amode) * value(i + 2, bmode);
      i += 4;
      break;
    case 3:
      ints[ints[i + 1]] = inputs.shift();
      i += 2;
      break;
    case 4:
      outputs.push(value(i + 1, amode));
      i += 2;
      break;
    case 5:
      if (value(i + 1, amode) !== 0) {
        i = value(i + 2, bmode);
      } else {
        i += 3;
      }
      break;
    case 6:
      if (value(i + 1, amode) === 0) {
        i = value(i + 2, bmode);
      } else {
        i += 3;
      }
      break;
    case 7:
      ints[ints[i + 3]] = value(i + 1, amode) < value(i + 2, bmode) ? 1 : 0;
      i += 4;
      break;
    case 8:
      ints[ints[i + 3]] = value(i + 1, amode) === value(i + 2, bmode) ? 1 : 0;
      i += 4;
      break;

    default:
      throw `unrecognised instruction ${ints[i]} at ${i}`;
  }
}

console.log(outputs.at(-1));
