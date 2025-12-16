import { text } from "node:stream/consumers";

const data = await text(process.stdin);

const connections = data
  .trim()
  .split("\n")
  .reduce((result, line) => {
    const [k, ...v] = line.split(/:? /);
    result[k] = v;

    return result;
  }, {});

function* path(positions, to, visited = new Set()) {
  for (const node of connections[positions[0]] || []) {
    if (visited.has(node)) {
      yield [node, ...positions];
      continue;
    }
    visited.add(node);
    if (positions.includes(node)) {
      // circular
      console.log("circular", positions);
      continue;
    }
    if (node === to) {
      yield [node, ...positions];
      continue;
    }
    yield* path([node, ...positions], to, visited);
  }
}

function count(start, lookup) {
  let c = 0;
  for (const path of lookup[start]) {
    c += 1;

    for (const part of path) {
      if (lookup[part]) {
        c += count(part, lookup);
      }
    }
  }
  return c;
}

function countFromTo(from, to) {
  const paths = Array.from(path([from], to));
  const pathLookup = {};
  for (const p of paths) {
    const [s, ...r] = p;
    pathLookup[s] ||= [];
    pathLookup[s].push(r);
  }
  return count(to, pathLookup);
}

console.log(
  countFromTo("svr", "fft") *
    countFromTo("fft", "dac") *
    countFromTo("dac", "out"),
);
