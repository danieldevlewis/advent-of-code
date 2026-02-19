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

// insert quarter
program[0] = 2;
const inputs = [];
const instance = run(inputs);
let score = 0;
let paddleX: number;
let ballX: number;
do {
  const n = instance.next();
  if (n.done) {
    break;
  }
  const x = n.value;
  const y = instance.next().value;
  const id = instance.next().value;

  if (id === 3) {
    paddleX = x;
  }

  // Just follow the ball with the paddle
  // The ball can only move one square at a time
  // And the paddle moves at the same speed
  if (id === 4) {
    ballX = x;
    if (paddleX < ballX) {
      inputs.push(1);
    } else if (paddleX > ballX) {
      inputs.push(-1);
    } else {
      inputs.push(0);
    }
  }

  if (x === -1 && y === 0) {
    // There is more than one way to play the game
    // as the ball can bounce differently depending on the angle it hits the paddle
    // However the total score is presumably always the same
    // But I can't figure out how the score is calculated
    score = id;
    continue;
  }
} while (true);

console.log(score);
