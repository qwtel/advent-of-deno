#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';;
import { pipe, map, range, permutations, max, grouped, findIndex, minBy, zip, product2 } from './util/lilit.ts';
import { Array2D } from './util/array2d.ts';

const input = (await read(Deno.stdin))
  .trim()
  .split('')
  .map(Number);

const width = 25;
const height = 6;

const layers = pipe(
  input,
  grouped(width * height),
  Array.from,
)

// 1
pipe(
  layers,
  map(l => [l, l.filter(p => p === 0).length]),
  minBy((a, b) => a[1] - b[1]),
  ([l]) => l.filter(p => p === 1).length * l.filter(p => p === 2).length,
  x =>  console.log(x),
)

// 2
const a = new Array2D([[0, 0], [width, height]], null);
for (const layer of layers) {
  const rows = pipe(layer, grouped(width));
  for (const [row, y] of zip(rows, range(0))) {
    for (const [p, x] of zip(row, range(0))) {
      if (p !== 2 && a.get([x, y]) === null) {
        a.set([x, y], p);
      }
    }
  }
}
console.log(a.map(x => x === 1 ? '+' : ' ').toString());
