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
