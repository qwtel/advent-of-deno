#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { ValMap, ValSet } from '../util/values.ts'
import { pipe, filter, map, constantly, grouped, count, find, every, sum, min, range, findIndex, flatMap, flatten, pluck, toArray, minByKey, product, mapValues, toMap, take, forEach, tap, filterValues, filterSecond, product2, pairwise, zip, skip, mapKeys, last, takeWhile, reverse, findLast, findLastIndex, unzip2, zipMap } from '../util/lilit.ts'
import { Graph } from '../util/graph2.ts'
import { addTo, mkNe } from '../util/vec2d.ts'
import { run } from './intcode.js'
(async () => {

const SIZE = 50;

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

function solve([sx, sy] = [0, 0], zoom = 1) {
  const coords = pipe(
    product2(range(0, SIZE), range(0, SIZE)),
    map(([x, y]) => [x * zoom + sx, y * zoom + sy]),
  );

  const world = new Array2D([[0, 0], [SIZE, SIZE]])

  for (const [x, y] of coords) {
    const { value } = run(input, [x, y]).next();
    world.set([Math.floor((x - sx) / zoom), Math.floor((y - sy) / zoom)], value === 1 ? '#' : '.');
  }

  if (env.DEBUG) console.log('' + world)

  return world;
}

// 1
pipe(solve(), filter(_ => _ === '#'), count(), console.log)

// 2
function solve2(precision) {
  const world = new Array2D([[0, 0], [precision, 1]], '.');
  for (const x of range(Math.floor(4/5 * precision), precision)) {
    world.set([x, 0], run(input, [x, precision - 1]).next().value === 1 ? '#' : '.');
  }

  // console.log('' + world)

  const lastRow = world._array[0];
  const x1 = pipe(lastRow, findIndex(_ => _ === '#'))
  const x2 = pipe(lastRow, findLastIndex(_ => _ === '#'))
  if (env.DEBUG) console.log('x', x1, x2)

  // integer math is hard..
  const k1 = (precision - 1) / (x1 - 0.5);
  const k2 = (precision - 1) / (x2 + 0.5);
  if (env.DEBUG) console.log('k', k1, k2)

  const x = (99.5 * (k2 + 1)) / (k1 - k2);
  const y = k2 * (x + 99.5);
  const xx = Math.round(x);
  const yy = Math.round(y);

  if (env.DEBUG) console.log(x, y)
  if (env.DEBUG) console.log(xx, yy)
  return [xx, yy];
}

pipe(solve2(25000), ([x, y]) => 10000 * x + y, console.log)

// const drift = 4
// pipe(
//   range(1000 + drift, 50000 + drift, 563),
//   zipMap(solve2), 
//   map(([i, [xx, yy]]) => [i, [xx - 1122, yy - 1248]]),
//   forEach(console.log),
// )


// function* descend([xx, yy]) {
//   let ix = xx;
//   let iy = yy;
//   for (;;) {
//     const tx = run(input, [ix + 99, iy]).next().value === 1;
//     const ty = run(input, [ix, iy + 99]).next().value === 1;
//     yield [[ix, iy], tx, ty]
//     if (!tx) ix--;
//     if (!ty) iy--;
//     if (tx && ty) { ix--; iy-- };
//     if (!tx && !ty) break;
//   }
// }

// pipe(
//   descend([xx + 1, yy + 1]),
//   takeWhile(([, tx, ty]) => tx || ty),
//   findLast(([, tx, ty]) => tx && ty),
//   ([[x, y]]) => 10000 * x + y,
//   console.log
// )

})();
