#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';;
import { pipe, zipMap, range, grouped, minByKey, zip2, toArray } from '../util/lilit.ts';
import { Array2D } from '../util/array2d.ts';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split('')
  .map(Number);

const width = 25;
const height = 6;

const layers = pipe(
  input,
  grouped(width * height),
  toArray(),
)

// 1
pipe(
  layers,
  zipMap(l => l.filter(p => p === 0).length),
  minByKey(1),
  ([l]) => l.filter(p => p === 1).length * l.filter(p => p === 2).length,
  console.log,
)

// 2
const arr2d = new Array2D([[0, 0], [width, height]], null);
for (const layer of layers) {
  const rows = pipe(layer, grouped(width));
  for (const [row, y] of zip2(rows, range(0))) {
    for (const [pixel, x] of zip2(row, range(0))) {
      if (pixel !== 2 && arr2d.get([x, y]) === null) {
        arr2d.set([x, y], pixel);
      }
    }
  }
}
console.log(arr2d.map(x => x === 1 ? '+' : ' ').toString());

})();