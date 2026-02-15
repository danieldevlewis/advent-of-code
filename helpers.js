/**
 * @param {any[]} items Items to generate combinations of
 * @param {number} count Length of the combinations
 * @returns {Generator<any[]>}
 */
export function* combinations(items, count) {
  if (count === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < items.length; i += 1) {
    for (const values of combinations(items.slice(i + 1), count - 1)) {
      yield [items[i], ...values];
    }
  }
}

/**
 * @param {any[]} items Items to generate combinations of
 * @param {number} count Length of the combinations
 * @returns {Generator<any[]>}
 */
export function* repeatedCombinations(items, count, from = 0) {
  if (count === 0) {
    yield [];
    return;
  }
  for (let i = from; i < items.length; i += 1) {
    for (const values of repeatedCombinations(items, count - 1, i)) {
      yield [items[i], ...values];
    }
  }
}

function* heaps(items, k) {
  if (k === 1) {
    yield [...items];
  } else {
    yield* heaps(items, k - 1);
    for (let i = 0; i < k - 1; i += 1) {
      if (k % 2 === 0) {
        const a = items[k - 1];
        const b = items[i];
        items[i] = a;
        items[k - 1] = b;
      } else {
        const a = items[k - 1];
        const b = items[0];
        items[0] = a;
        items[k - 1] = b;
      }
      yield* heaps(items, k - 1);
    }
  }
}

/**
 * @param {any[]} items Items to generate permutations of
 * @param {number} count Length of the permutations.  Defaults to items length.
 * @returns {Generator<any[]>}
 */
export function* permutations(items, count = items.length) {
  yield* heaps(items, count);
  // for (const combination of combinations(items, count)) {
  //   yield* heaps(combination, count);
  // }
}

/**
 * @param {any[]} items Items to generate permutations of
 * @param {number} count Length of the permutations
 * @returns {Generator<any[]>}
 */
export function* repeatedPermutations(items, count) {
  const indexes = Array(count).fill(0);
  const n = count - 1;
  const l = items.length;
  do {
    yield indexes.map((i) => items[i]);
    for (let k = n; k >= 0; k -= 1) {
      indexes[k] += 1;
      if (indexes[k] === l) {
        if (k === 0) {
          return;
        }
        indexes[k] = 0;
      } else {
        break;
      }
    }
  } while (true);
}
