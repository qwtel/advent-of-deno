#!/usr/bin/env -S deno --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, sum, takeWhile, scan, constantly } from './util/lilit.ts'

const input = (await read(Deno.stdin))
  .trim()
  .split('\n')
  .map(Number);

const fuel = pipe(
  input,
  map(x => Math.floor(x / 3) - 2),
  sum(),
);

console.log(fuel);

const calcFuel = x => Math.max(Math.floor(x / 3) - 2, 0);

// "Imperative" solution
// const calcFuel2 = (x) => pipe(x,
//   function* (x) {
//     let f = x;
//     while (true) {
//       f = calcFuel(f);
//       if (f > 0) yield f; else break
//     }
//   },
//   sum()
// )

const calcFuel2_ = (x) => pipe(
  constantly(),
  scan(calcFuel, x),
  takeWhile(x => x > 0),
  sum(),
);

const fuel2 = pipe(
  input,
  map(calcFuel2_),
  sum(),
);

console.log(fuel2);
