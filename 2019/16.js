#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, map, range, sum, cycle, zip, skip, flatMap, constantly, toArray, take } from '../util/iter.ts';
(async () => {

const env = Deno.env();

const input = (await read())
  .trim()
  .split('')
  .map(Number);

const pattern = [0, 1, 0, -1]

let working = [...input]
for (let phase = 0; phase < 100; phase++) {
  if (env.DEBUG && phase % 10 === 0) console.log(phase)

  working = pipe(
    range(0, input.length),
    map(i => pipe(
      zip(
        working,
        pipe(cycle(pattern), flatMap(n => constantly(n, i + 1)), skip(1)),
      ),
      map(([a, b]) => a * b),
      sum(),
      Math.abs,
      _ => _ % 10,
    )),
    toArray(),
  );

  if (env.DEBUG) {
    console.log([...working].join(''))
    console.log('...')
  }
}

console.log(pipe(working, take(8), toArray()).join(''))

// let working2 = [...cycle(input, 1000)]

})();
