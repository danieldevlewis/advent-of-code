import { text } from "node:stream/consumers";
import { permutations } from "../helpers.js";

const program = (await text(process.stdin))
  .split(",")
  .map((v) => v.trim())
  .map(Number);

function* run(inputs: number[]) {
  const ints = [...program];

  function value(i: number, mode: string) {
    let v = ints[i];
    if (mode === "0") {
      v = ints[v];
    }
    return v;
  }

  loop: for (let i = 0; i < ints.length; ) {
    const [_cmode, bmode, amode, ...opcode] = ints[i]
      .toString()
      .padStart(5, "0")
      .split("");

    switch (parseInt(opcode.join(""), 10)) {
      case 99:
        break loop;
      case 1:
        ints[ints[i + 3]] = value(i + 1, amode) + value(i + 2, bmode);
        i += 4;
        break;
      case 2:
        ints[ints[i + 3]] = value(i + 1, amode) * value(i + 2, bmode);
        i += 4;
        break;
      case 3: {
        const input = inputs.shift();
        ints[ints[i + 1]] = input;
        i += 2;
        break;
      }
      case 4: {
        yield value(i + 1, amode);
        i += 2;
        break;
      }
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
        ints[ints[i + 3]] = value(i + 1, amode) < value(i + 2, bmode) ? 1 : 0;
        i += 4;
        break;
      case 8:
        ints[ints[i + 3]] = value(i + 1, amode) === value(i + 2, bmode) ? 1 : 0;
        i += 4;
        break;

      default:
        throw `unrecognised instruction ${ints[i]} at ${i}`;
    }
  }
}

function makeThruster(
  inputs: number[],
): (value: number) => IteratorResult<number> {
  const thruster = run(inputs);

  return (v: number): IteratorResult<number> => {
    inputs.push(v);
    return thruster.next();
  };
}

console.log(
  Math.max(
    ...permutations([5, 6, 7, 8, 9]).map(([pa, pb, pc, pd, pe]) => {
      const a = makeThruster([pa]);
      const b = makeThruster([pb]);
      const c = makeThruster([pc]);
      const d = makeThruster([pd]);
      const e = makeThruster([pe]);

      let r = { value: 0, done: false } as IteratorResult<number>;
      let value: number;
      do {
        r = a(r.value);
        if (r.done) {
          break;
        }
        r = b(r.value);
        if (r.done) {
          break;
        }
        r = c(r.value);
        if (r.done) {
          break;
        }
        r = d(r.value);
        if (r.done) {
          break;
        }
        r = e(r.value);
        if (r.done) {
          break;
        }
        value = r.value;
      } while (true);
      return value;
    }),
  ),
);
