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

type Position = [number, number];

class Grid<T> {
  #grid = new Map<number, Map<number, T>>();

  constructor(values: Iterable<[Position, T]> = []) {
    for (const [p, v] of values) {
      this.set(p, v);
    }
  }

  *[Symbol.iterator](): Generator<[Position, T]> {
    for (const [y, m] of this.#grid) {
      for (const [x, v] of m) {
        yield [[x, y], v];
      }
    }
  }

  *values(): Generator<T> {
    for (const [, m] of this.#grid) {
      for (const [, v] of m) {
        yield v;
      }
    }
  }

  get([x, y]: Position): T {
    return this.#grid.get(y)?.get(x);
  }

  set([x, y]: Position, value: T) {
    if (!this.#grid.has(y)) {
      this.#grid.set(y, new Map());
    }
    this.#grid.get(y).set(x, value);
  }

  delete([x, y]: Position) {
    this.#grid.get(y)?.delete?.(x);
  }

  find(value: T): Position {
    for (const [p, v] of this) {
      if (v === value) {
        return p;
      }
    }
    return null;
  }

  xrange(yrange = this.yrange()): [number, number] {
    const [ymin, ymax] = yrange;
    const v = [
      ...new Set(
        this.#grid
          .entries()
          .filter(([y]) => y >= ymin && y <= ymax)
          .flatMap(([, r]) => r.keys()),
      ),
    ];

    return [Math.min(...v), Math.max(...v)];
  }

  yrange(): [number, number] {
    const v = this.#grid.keys().toArray();

    return [Math.min(...v), Math.max(...v)];
  }

  draw(
    fn: (value: T, position?: Position) => string = (v: T) =>
      String(v ?? " ")[0],
    {
      lineNumbers = true,
      columnNumbers = true,
      yrange = this.yrange(),
      xrange = this.xrange(yrange),
    } = {},
  ) {
    const [ymin, ymax] = yrange;
    const [xmin, xmax] = xrange;
    if (columnNumbers) {
      if (lineNumbers) {
        process.stdout.write(
          Array(ymax.toString().length + 1)
            .fill(" ")
            .join(""),
        );
        for (let x = xmin; x <= xmax; x += 1) {
          process.stdout.write((x % 10).toString());
        }
        process.stdout.write("\n");
      }
    }
    for (let y = ymin; y <= ymax; y += 1) {
      if (lineNumbers) {
        process.stdout.write(
          y.toString().padStart(ymax.toString().length, " ") + " ",
        );
      }
      for (let x = xmin; x <= xmax; x += 1) {
        const p: Position = [x, y];
        process.stdout.write(fn(this.get(p), p));
      }
      process.stdout.write("\n");
    }
  }

  clone(): Grid<T> {
    return new Grid<T>(this);
  }
}

const grid = new Grid<boolean>();

// Start from when the beam becomes continuous
let y = 5;
let startx = 0;
let endx: number;
const beam: [number, number, number][] = [];
const targetSize = 100;

do {
  let inBeam = false;
  let start: number;
  let x = startx;
  do {
    const inputs = [];
    const sensor = run(inputs);
    inputs.push(x, y);
    const value = sensor.next().value;
    if (value === 1) {
      start ||= x;
      grid.set([x, y], true);
      if (!inBeam && endx) {
        x = endx;
        grid.set([endx, y], true);
      }
      inBeam = true;
    } else if (inBeam) {
      // end of beam
      endx = x - 1;
      break;
    }
    x += 1;
  } while (true);
  startx = start;

  beam.push([y, start, x - 1]);

  if (x - startx >= targetSize) {
    if (beam.length > targetSize) {
      const [l, _, e] = beam.at(-targetSize);
      if (e === start + targetSize - 1) {
        // grid.draw((v) => (v ? "#" : " "), { yrange: [l, y] });
        console.log((e - (targetSize - 1)) * 10000 + l);
        break;
      }
    }
  }

  y += 1;
} while (true);
