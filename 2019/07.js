#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, map, range, permutations, max } from '../util/lilit.ts';
import { run } from './05_run.js';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(Number);

// 1
function solve1([pa, pb, pc, pd, pe]) {
  const [r1] = [...run(input, pa, 0)];
  const [r2] = [...run(input, pb, r1)];
  const [r3] = [...run(input, pc, r2)];
  const [r4] = [...run(input, pd, r3)];
  const [r5] = [...run(input, pe, r4)];
  return r5;
}

pipe(
  permutations(range(0, 5), 5),
  map(solve1),
  max(),
  console.log,
);

// 2
function solve2([pa, pb, pc, pd, pe]) {
  let v1, v2, v3, v4, v5 = 0;
  let done;
  let res;

  const amp1 = run(input, pa, v5);
  ({ value: v1 } = amp1.next());
  const amp2 = run(input, pb, v1);
  ({ value: v2 } = amp2.next());
  const amp3 = run(input, pc, v2);
  ({ value: v3 } = amp3.next());
  const amp4 = run(input, pd, v3);
  ({ value: v4 } = amp4.next());
  const amp5 = run(input, pe, v4);
  ({ value: v5, done } = amp5.next());

  while (!done) {
    ({ value: v1 } = amp1.next(v5));
    ({ value: v2 } = amp2.next(v1));
    ({ value: v3 } = amp3.next(v2));
    ({ value: v4 } = amp4.next(v3));
    ({ value: v5, done } = amp5.next(v4));
    if (!done) res = v5;
  }

  return res;
}

pipe(
  permutations(range(5, 10), 5),
  map(solve2),
  max(),
  console.log,
);

})();