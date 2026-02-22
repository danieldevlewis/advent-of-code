import { text } from "node:stream/consumers";

// Same solution as the first part however following a portal changes the level.
// - Distances now need indexing by level.
// - Queue should prioritise lower levels

type Position = [number, number];

function equalsPosition([x1, y1]: Position, [x2, y2]: Position) {
  return x1 === x2 && y1 === y2;
}

class PositionMap {
  #grid = new Map<number, Map<number, [Position, number, string]>>();

  get([x, y]: Position): [Position, number, string] {
    return this.#grid.get(y)?.get(x);
  }

  set(from: Position, to: Position, deeper: number, name: string) {
    const [x1, y1] = from;
    if (!this.#grid.has(y1)) {
      this.#grid.set(y1, new Map());
    }
    this.#grid.get(y1).set(x1, [to, deeper, name]);
  }

  delete([x, y]: Position) {
    if (this.#grid.has(y)) {
      this.#grid.get(y).delete(x);
      if (this.#grid.get(y).size === 0) {
        this.#grid.delete(y);
      }
    }
  }
}

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

  *rows(): Generator<Generator<T>> {
    const [ymin, ymax] = this.yrange();
    const [xmin, xmax] = this.xrange();
    const self = this;
    for (let y = ymin; y <= ymax; y += 1) {
      yield (function* () {
        for (let x = xmin; x <= xmax; x += 1) {
          yield self.get([x, y]);
        }
      })();
    }
  }

  *columns(): Generator<Generator<T>> {
    const [ymin, ymax] = this.yrange();
    const [xmin, xmax] = this.xrange();
    const self = this;
    for (let x = xmin; x <= xmax; x += 1) {
      yield (function* () {
        for (let y = ymin; y <= ymax; y += 1) {
          yield self.get([x, y]);
        }
      })();
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

const maze = new Grid<boolean>();
const letters = new Grid<string>();
const portals = new PositionMap();
const portalList = new Map<string, [Position, Position, boolean][]>();

(await text(process.stdin)).split("\n").forEach((c, y) => {
  c.split("").forEach((c, x) => {
    if (c === ".") {
      maze.set([x, y], true);
    }
    if (c === "#") {
      maze.set([x, y], false);
    }
    if (/[A-Z]/.test(c)) {
      letters.set([x, y], c);
    }
  });
});

const [ymin, ymax] = letters.yrange();
const [xmin, xmax] = letters.xrange();

letters.rows().forEach((r, y) => {
  let prevLetter: string = null;
  r.forEach((c, x) => {
    if (/[A-Z]/.test(c)) {
      if (prevLetter) {
        // Found
        const name = prevLetter + c;
        if (maze.get([x + 1, y])) {
          if (!portalList.has(name)) {
            portalList.set(name, []);
          }
          portalList
            .get(name)
            .push([[x, y], [x + 1, y], x - 1 === xmin || x - 1 === xmax]);
        }
        if (maze.get([x - 2, y])) {
          if (!portalList.has(name)) {
            portalList.set(name, []);
          }
          portalList
            .get(name)
            .push([[x - 1, y], [x - 2, y], x === xmin || x === xmax]);
        }
      } else {
        prevLetter = c;
      }
    } else {
      prevLetter = null;
    }
  });
});

letters.columns().forEach((r, x) => {
  let prevLetter: string = null;
  r.forEach((c, y) => {
    if (/[A-Z]/.test(c)) {
      if (prevLetter) {
        // Found
        const name = prevLetter + c;
        if (maze.get([x, y + 1])) {
          if (!portalList.has(name)) {
            portalList.set(name, []);
          }
          portalList
            .get(name)
            .push([[x, y], [x, y + 1], y - 1 === ymin || y - 1 === ymax]);
        }
        if (maze.get([x, y - 2])) {
          if (!portalList.has(name)) {
            portalList.set(name, []);
          }
          portalList
            .get(name)
            .push([[x, y - 1], [x, y - 2], y === ymin || y === ymax]);
        }
      } else {
        prevLetter = c;
      }
    } else {
      prevLetter = null;
    }
  });
});

const start = portalList.get("AA")[0][1];
portalList.delete("AA");
const end = portalList.get("ZZ")[0][1];
portalList.delete("ZZ");

portalList.forEach(([[en1, ex1, o1], [en2, ex2, o2]], name) => {
  let dir = 0;
  if (o1 && !o2) {
    dir = -1;
  }
  if (!o1 && o2) {
    dir = 1;
  }
  portals.set(en1, ex2, dir, name);
  portals.set(en2, ex1, -dir, name);
});

const visited = [new Grid<number>([[start, 0]])];
const queue: [number, number, Position][] = [[0, 0, start]];

const UP = [-1, 0];
const DOWN = [1, 0];
const LEFT = [0, -1];
const RIGHT = [0, 1];

loop: do {
  queue.sort(([a1, b1], [a2, b2]) => (b1 === b2 ? a1 - a2 : b1 - b2));
  const [d, l, [x, y]] = queue.shift();
  for (const [mx, my] of [UP, DOWN, LEFT, RIGHT]) {
    let n: Position = [x + mx, y + my];
    let nl = l;
    if (equalsPosition(end, n) && l === 0) {
      console.log(d + 1);
      break loop;
    }
    const p = portals.get(n);
    if (p) {
      n = p[0];
      nl += p[1];
      if (nl < 0) {
        continue;
      }
    }
    const c = maze.get(n);
    if (!c) {
      continue;
    }
    if (!visited[nl]) {
      visited[nl] = new Grid<number>();
    }
    if ((visited[nl].get(n) ?? Infinity) < d + 1) {
      continue;
    }
    visited[nl].set(n, d + 1);
    queue.push([d + 1, nl, n]);
  }
  if (queue.length === 0) {
    break;
  }
} while (true);
