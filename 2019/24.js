#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { Array2D, neighbors4 } from '../util/array2d.ts'
import { eq, ne } from '../util/vec2.ts'
import { pipe,  map, find, sum, zipMap, range, mapKeys, toMap, sort, first, flatMap, constantly, zip3, distinct, groupBy, nth, toSet, pluckValues, filterKeys } from '../util/iter.ts'
import { ValSet, ValMap } from '../util/values.ts'
(async () => {

// const call = f => (...args) => f(args);
// const apply = f => (args) => f(...args);

const env = Deno.env();

const input = Array2D.fromString(await read(Deno.stdin));

if (env.DEBUG) console.log('' + input);

const liveOrDie = (bug, nr) => bug === 1
  ? nr === 1 ? 1 : 0
  : nr === 1 || nr === 2 ? 1 : 0;

function* solve(eris) {
  for (;;) {
    eris = eris.map((v, p) => {
      const nr = pipe(eris.neighboringValues4(p), sum());
      return liveOrDie(v, nr);
    })
    if (env.DEBUG) console.log('' + eris.map(_ => _ ? '#' : '.'));
    yield eris;
  }
}

const calcBiodiversity = xs => pipe(
  [...xs.values()].entries(),
  map(([i, v]) => v * 2 ** i),
  sum(),
);

const hasOrInsert = (set, val) => {
  const has = set.has(val);
  set.add(val);
  return has;
}

const eris = input.map(v => v === '#' ? 1 : 0)
const seen = new ValSet([eris.toPointMap()]);
pipe(
  solve(eris),
  zipMap(_ => _.toPointMap()),
  find(([, pm]) => hasOrInsert(seen, pm)),
  first(),
  calcBiodiversity,
  console.log,
);

// 2
// A modified 4-neighbor function based on the description.
// Points are now represented as triples of `[level, x, y]`.
function neighbors4Inf([lvl, x, y]) {
  return pipe(neighbors4([x, y]), flatMap(([x2, y2]) => {
    if (x2 === 2 && y2 === 2) {
      if (x === 2 && y === 1) return [...zip3(constantly(lvl + 1), range(0, 5), constantly(0))];
      if (x === 2 && y === 3) return [...zip3(constantly(lvl + 1), range(0, 5), constantly(4))];
      if (x === 1 && y === 2) return [...zip3(constantly(lvl + 1), constantly(0), range(0, 5))];
      if (x === 3 && y === 2) return [...zip3(constantly(lvl + 1), constantly(4), range(0, 5))];
    }
    if (x2 < 0 || x2 >= 5 || y2 < 0 || y2 >= 5) {
      if (x2 < 0) return [[lvl - 1, 1, 2]];
      if (x2 >= 5) return [[lvl - 1, 3, 2]];
      if (y2 < 0) return [[lvl - 1, 2, 1]];
      if (y2 >= 5) return [[lvl - 1, 2, 3]];
    }
    return [[lvl, x2, y2]];
  }))
}

// Not very fast, but small in terms of code size.
// We get the neighbors of every point and put them into a set to get rid of duplicates
// (This effectively extends the border by 1 unit).
// Then we just perform our lifecycle function on every point and repeat.
function* solve2(eris) {
  for (let curr = eris, i = 0;; i++) {
    curr = pipe(
      curr.keys(),
      flatMap(neighbors4Inf),
      toSet(ValSet), // unique
      map(point => {
        const value = curr.get(point) || 0;
        const nr = pipe(neighbors4Inf(point), map(p => curr.get(p) || 0), sum());
        return [point, liveOrDie(value, nr)];
      }),
      toMap(ValMap),
    );
    if (env.DEBUG) console.log(i);
    yield curr;
  }
}

// Adding level 0 to the initial scan.
const eris2 = new ValMap(pipe(eris.entries(), filterKeys(p => ne(p, [2, 2])), mapKeys(p => [0, ...p])));

pipe(
  solve2(eris2),
  nth(200),
  pluckValues(),
  sum(),
  console.log,
);


function debug(eris) {
  const levels = pipe(eris, map(([[level]]) => level), distinct(), sort((a, b) => a - b));
  const fieldByLevel = pipe(eris, groupBy(([[level]]) => level));
  for (const level of levels) {
    const arr2d = pipe(fieldByLevel.get(level), mapKeys(([, x, y]) => [x, y]), Array2D.fromPointMap);
    console.log(`Depth ${level}:`);
    console.log('' + arr2d.map((v, p) => eq(p, [2, 2]) ? '?' : v ? '#' : '.'));
  }
}


})()
