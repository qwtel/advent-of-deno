#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { add, addTo, eq, sub, mkNe as notEq } from '../util/vec2d.ts';
import { pipe, filter, map, concat2, first, zip2, range, sum, cycle, zip, skip, flatMap, constantly, toArray, take, repeat, tap } from '../util/lilit.ts';
import { notIn, last, notEmpty, wrap } from '../util/other.ts'
import { run } from './intcode.js';
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