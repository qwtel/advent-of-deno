#!/usr/bin/env -S deno --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, map, sum, takeWhile, scan, constantly } from '../util/lilit.ts'

(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split('\n')
  .map(Number);

const calcFuel = x => Math.floor(x / 3) - 2;

pipe(
  input,
  map(calcFuel),
  sum(),
  console.log,
);

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

const calcFuel2 = (x) => pipe(
  constantly(),
  scan(calcFuel, x),
  takeWhile(x => x > 0),
  sum(),
);

pipe(
  input,
  map(calcFuel2),
  sum(),
  console.log,
);

})();