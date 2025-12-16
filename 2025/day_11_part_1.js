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

function* path(positions) {
  for (const node of connections[positions[0]]) {
    if (positions.includes(node)) {
      // circular
      console.log("circular", positions);
      continue;
    }
    if (node === "out") {
      yield [node, ...positions];
      continue;
    }
    yield* path([node, ...positions]);
  }
}

console.log(Array.from(path(["you"])).length);
