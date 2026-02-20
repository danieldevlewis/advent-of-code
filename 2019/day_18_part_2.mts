import { text } from "node:stream/consumers";

// Mostly the same solution as part 1
//
// However the nearest key finding generator
// now checks four keys
//
// This is actually quite fast to find a solution
// compared to part 1

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

  xrange(): [number, number] {
    const v = [...new Set(this.#grid.values().flatMap((r) => r.keys()))];

    return [Math.min(...v), Math.max(...v)];
  }

  yrange(): [number, number] {
    const v = this.#grid.keys().toArray();

    return [Math.min(...v), Math.max(...v)];
  }

  draw(fn = (v: T) => String(v ?? " ")) {
    const [ymin, ymax] = this.yrange();
    const [xmin, xmax] = this.xrange();
    for (let y = ymin; y <= ymax; y += 1) {
      for (let x = xmin; x <= xmax; x += 1) {
        process.stdout.write(fn(this.get([x, y])));
      }
      process.stdout.write("\n");
    }
  }

  clone(): Grid<T> {
    return new Grid<T>(this);
  }
}

const UP = [0, -1];
const DOWN = [0, 1];
const RIGHT = [1, 0];
const LEFT = [-1, 0];

function* nearestKeys(
  grid: Grid<string>,
  from: Position,
): Generator<[Position, string, number]> {
  const visited = new Grid<number>();
  const queue: [number, Position][] = [[0, from]];
  do {
    const [d, [x, y]] = queue.shift();
    for (const [dx, dy] of [UP, DOWN, LEFT, RIGHT]) {
      const n: Position = [x + dx, y + dy];
      if (visited.get(n) !== undefined) {
        continue;
      }
      const c = grid.get(n);
      if (c === "#" || /[A-Z]/.test(c)) {
        continue;
      }
      const nd = d + 1;
      if (/[a-z]/.test(c ?? "")) {
        yield [n, c, nd];
      }
      visited.set(n, nd);
      queue.push([nd, n]);
    }
  } while (queue.length > 0);
}

function* nearestGroupKeys(
  grid: Grid<string>,
  from: Position[],
): Generator<[Position[], string, number]> {
  const all = from
    .flatMap(
      (p, i) =>
        [...nearestKeys(grid, p)].map((p) => [...p, i]) as [
          Position,
          string,
          number,
          number,
        ][],
    )
    .sort(([, , a], [, , b]) => a - b);

  for (const [p, c, d, i] of all) {
    yield [from.map((f, index) => (index === i ? p : f)), c, d];
  }
}

const grid = (await text(process.stdin))
  .trim()
  .split("\n")
  .reduce((g, row, y) => {
    row.split("").forEach((c, x) => {
      if (c !== ".") {
        g.set([x, y], c);
      }
    });
    return g;
  }, new Grid<string>());

const tunnel = grid.find("@");
grid.set(tunnel, "#");
grid.set([tunnel[0], tunnel[1] + 1], "#");
grid.set([tunnel[0], tunnel[1] - 1], "#");
grid.set([tunnel[0] + 1, tunnel[1]], "#");
grid.set([tunnel[0] - 1, tunnel[1]], "#");

grid.draw();

const gc = grid.clone();

const queue: [
  number,
  number,
  Grid<string>,
  Generator<[Position[], string, number]>,
  string[],
][] = [
  [
    0,
    0,
    gc,
    nearestGroupKeys(gc, [
      [tunnel[0] + 1, tunnel[1] + 1],
      [tunnel[0] - 1, tunnel[1] + 1],
      [tunnel[0] + 1, tunnel[1] - 1],
      [tunnel[0] - 1, tunnel[1] - 1],
    ]),
    [],
  ],
];

const maxKeys = grid
  .values()
  .filter((v) => /[a-z]/.test(v))
  .toArray().length;

let shortest = Infinity;
do {
  queue.sort(([k1, d1], [k2, d2]) => (k1 === k2 ? d1 - d2 : k2 - k1));
  const [k, d, g, n, keys] = queue.shift();

  if (d + 1 >= shortest) {
    continue;
  }

  const next = n.next();
  if (next.done) {
    continue;
  }
  queue.push([k, d, g, n, keys]);

  const [np, v, nd] = next.value;

  const cd = nd + d;

  if (k + 1 === maxKeys) {
    if (cd < shortest) {
      shortest = cd;
      console.log(cd, keys);
    }
    continue;
  }

  const ng = g.clone();
  ng.delete(ng.find(v));
  const del = ng.find(v.toUpperCase());
  if (del) {
    ng.delete(del);
  }

  queue.push([k + 1, cd, ng, nearestGroupKeys(ng, np), [...keys, v]]);
} while (queue.length > 0);
