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

const NORTH = 1;
const SOUTH = 2;
const WEST = 3;
const EAST = 4;

const grid = new Map<number, Map<number, number>>([[0, new Map([[0, 0]])]]);
const paths = [[NORTH], [SOUTH], [EAST], [WEST]];
const inputs = [];
const robot = run(inputs);

function coord(path: number[]) {
  const position = [0, 0];

  for (const movement of path) {
    switch (movement) {
      case NORTH:
        position[0] -= 1;
        break;
      case SOUTH:
        position[0] += 1;
        break;
      case EAST:
        position[1] -= 1;
        break;
      case WEST:
        position[1] += 1;
        break;
    }
  }
  return position;
}

function walk(path: number[]) {
  let result: number;
  for (const movement of path) {
    inputs.push(movement);
    result = robot.next().value;
  }
  return result;
}

function reverseWalk(path: number[]) {
  let result: number;
  path = path.toReversed().map(
    (d) =>
      ({
        [NORTH]: SOUTH,
        [EAST]: WEST,
        [WEST]: EAST,
        [SOUTH]: NORTH,
      })[d],
  );
  for (const movement of path) {
    inputs.push(movement);
    result = robot.next().value;
  }
  return result;
}

function draw(grid: Map<number, Map<number, number>>) {
  for (
    let y1 = Math.min(...grid.keys());
    y1 <= Math.max(...grid.keys());
    y1 += 1
  ) {
    for (
      let x1 = Math.min(...grid.values().flatMap((v) => v.keys()));
      x1 <= Math.max(...grid.values().flatMap((v) => v.keys()));
      x1 += 1
    ) {
      const value = grid.get(y1)?.get(x1);
      process.stdout.write(
        value === Infinity ? "█" : String(value ?? " ").at(-1),
      );
    }
    process.stdout.write("\n");
  }
}

do {
  // Create a set of paths to visit
  // After successfully visiting a path:
  //  - mark the distance on the grid
  //  - add any unvisited locations as a new path
  //  - go back to the start
  //
  // This would be faster with some memorisation
  // and not going back to the start each time

  const path = paths.shift();
  if (!path) {
    break;
  }
  const result = walk(path);
  if (result === 2) {
    draw(grid);
    console.log(path.length);
    break;
  }
  if (result === 1) {
    [NORTH, SOUTH, EAST, WEST]
      .map((d) => [...path, d])
      .filter((p) => {
        const c = coord(p);
        return grid.get(c[1])?.get(c[0]) === undefined;
      })
      .forEach((p) => {
        paths.push(p);
      });

    const c = coord(path);
    if (!grid.has(c[1])) {
      grid.set(c[1], new Map());
    }
    grid.get(c[1]).set(c[0], path.length);
    reverseWalk(path);
  }
  if (result === 0) {
    reverseWalk(path.slice(0, -1));
    const c = coord(path);
    if (!grid.has(c[1])) {
      grid.set(c[1], new Map());
    }
    grid.get(c[1]).set(c[0], Infinity);
  }
} while (true);
