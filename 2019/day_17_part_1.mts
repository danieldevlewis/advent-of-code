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

function* run(inputs: number[] = []): Generator<number> {
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

function draw(grid: Map<number, Map<number, string>>) {
  for (
    let y = Math.min(...grid.keys());
    y <= Math.max(...grid.keys());
    y += 1
  ) {
    for (
      let x = Math.min(...grid.values().flatMap((v) => v.keys()));
      x <= Math.max(...grid.values().flatMap((v) => v.keys()));
      x += 1
    ) {
      if (
        grid.get(y)?.get(x) === "#" &&
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].every(([x1, y1]) => grid.get(y + y1)?.get(x + x1) === "#")
      ) {
        process.stdout.write("O");
      } else {
        process.stdout.write(grid.get(y)?.get(x) || " ");
      }
    }
    process.stdout.write("\n");
  }
}

const grid = new Map<number, Map<number, string>>([[0, new Map()]]);

let x = 0;
let y = 0;
for (const n of run()) {
  switch (n) {
    case 46:
      x += 1;
      continue;
    case 10:
      y += 1;
      x = 0;
      grid.set(y, new Map());
      break;
    default:
      x += 1;
      grid.get(y).set(x, String.fromCharCode(n));
  }
}

draw(grid);

let alignment = 0;
for (let y = Math.min(...grid.keys()); y <= Math.max(...grid.keys()); y += 1) {
  for (
    let x = Math.min(...grid.values().flatMap((v) => v.keys()));
    x <= Math.max(...grid.values().flatMap((v) => v.keys()));
    x += 1
  ) {
    if (
      grid.get(y)?.get(x) === "#" &&
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].every(([x1, y1]) => grid.get(y + y1)?.get(x + x1) === "#")
    ) {
      alignment += x * y;
    }
  }
}

console.log(alignment);
