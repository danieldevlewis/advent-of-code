import { text } from "node:stream/consumers";

const ints = (await text(process.stdin)).split(",").map(Number);

ints[1] = 12;
ints[2] = 2;

loop: for (let i = 0; i < ints.length; ) {
  switch (ints[i]) {
    case 99:
      break loop;
    case 1:
      ints[ints[i + 3]] = ints[ints[i + 1]] + ints[ints[i + 2]];
      i += 4;
      break;
    case 2:
      ints[ints[i + 3]] = ints[ints[i + 1]] * ints[ints[i + 2]];
      i += 4;
      break;
    default:
      throw `unrecognised instruction ${ints[i]} at ${i}`;
  }
}

console.log(ints[0]);
