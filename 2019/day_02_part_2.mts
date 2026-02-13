import { text } from "node:stream/consumers";

const input = (await text(process.stdin)).split(",").map(Number);

search: for (let x = 0; x <= 99; x++) {
  for (let y = 0; y <= 99; y++) {
    const ints = [...input];
    ints[1] = x;
    ints[2] = y;

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
    if (ints[0] === 19690720) {
      console.log(100 * x + y);
      break search;
    }
  }
}
