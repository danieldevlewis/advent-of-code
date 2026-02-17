import { text } from "node:stream/consumers";

const program = (await text(process.stdin))
  .split(",")
  .map((v) => v.trim())
  .map(Number);

program.forEach((i, index) => {
  if (i > Number.MAX_SAFE_INTEGER) {
    throw new Error(`MAX_SAFE_INTEGER exceeded: ${i} ${index}`);
  }
});

function* run(inputs: number[] = []) {
  const ints = [...program];
  let relativeBase = 0;

  function value(i: number, mode: string) {
    let v = ints[i] || 0;
    if (mode === "0") {
      v = ints[v] || 0;
    }
    if (mode === "2") {
      v = ints[v + relativeBase] || 0;
    }
    return v;
  }

  function write(i: number, v: number, mode: string) {
    if (v > Number.MAX_SAFE_INTEGER) {
      throw new Error("max safe integer exceeded");
    }
    switch (mode) {
      case "0":
        ints[ints[i] || 0] = v;

        break;
      case "2":
        ints[(ints[i] || 0) + relativeBase] = v;
        break;
    }
  }

  loop: for (let i = 0; i < ints.length; ) {
    const [cmode, bmode, amode, ...opcode] = ints[i]
      .toString()
      .padStart(5, "0")
      .split("");

    switch (parseInt(opcode.join(""), 10)) {
      case 99:
        break loop;
      case 1:
        write(i + 3, value(i + 1, amode) + value(i + 2, bmode), cmode);
        i += 4;
        break;
      case 2:
        write(i + 3, value(i + 1, amode) * value(i + 2, bmode), cmode);
        i += 4;
        break;
      case 3: {
        const input = inputs.shift();
        if (input === undefined) {
          throw new Error("expected input");
        }
        write(i + 1, input, amode);
        i += 2;
        break;
      }
      case 4:
        yield value(i + 1, amode);
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
        write(i + 3, value(i + 1, amode) < value(i + 2, bmode) ? 1 : 0, cmode);
        i += 4;
        break;
      case 8:
        write(
          i + 3,
          value(i + 1, amode) === value(i + 2, bmode) ? 1 : 0,
          cmode,
        );
        i += 4;
        break;
      case 9:
        relativeBase += value(i + 1, amode);
        i += 2;
        break;
      default:
        throw `unrecognised instruction ${ints[i]} at ${i}`;
    }
  }
}

const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

const inputs = [];
const instance = run(inputs);
const grid = new Map<number, Map<number, number>>();
grid.set(0, new Map([[0, 1]]));

let x = 0;
let y = 0;
let dir = UP;

do {
  inputs.push(grid.get(y)?.get(x) || 0);
  const n = instance.next();
  if (n.done) {
    break;
  }
  if (!grid.has(y)) {
    grid.set(y, new Map());
  }
  grid.get(y).set(x, n.value as number);
  const turn = instance.next().value;
  if (turn === 0) {
    dir -= 1;
    if (dir === -1) {
      dir = 3;
    }
  } else {
    dir += 1;
    dir %= 4;
  }
  switch (dir) {
    case UP:
      y -= 1;
      break;
    case DOWN:
      y += 1;
      break;
    case LEFT:
      x -= 1;
      break;
    case RIGHT:
      x += 1;
      break;
  }
} while (true);

process.stdout.write("\n");
for (
  let y1 = Math.min(...grid.keys());
  y1 <= Math.max(...grid.keys());
  y1 += 1
) {
  for (
    let x1 = Math.min(...grid.values().flatMap((v) => v.keys()));
    x1 < Math.max(...grid.values().flatMap((v) => v.keys()));
    x1 += 1
  ) {
    process.stdout.write(grid.get(y1)?.get(x1) ? "█" : " ");
  }
  process.stdout.write("\n");
}
process.stdout.write("\n");
