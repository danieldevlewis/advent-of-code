import { text } from "node:stream/consumers";

const orbits = new Map<string, string>(
  (await text(process.stdin))
    .trim()
    .split("\n")
    .map((v) => v.split(")").reverse() as [string, string]),
);

function parents(name: string) {
  let parents = [];
  let cursor = orbits.get(name);
  while (cursor) {
    parents.push(cursor);
    cursor = orbits.get(cursor);
  }
  return parents;
}

const santa = parents("SAN");
const you = parents("YOU");
const shared = santa.find((orbit) => you.includes(orbit));
console.log(santa.indexOf(shared) + you.indexOf(shared));
