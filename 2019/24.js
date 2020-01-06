#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { len } from '../util/vec2.ts'
import { pipe, filter, map, rangeX, some, filterSecond, find, count, sum, reduce, zipMap, tap, zip, zip2, zipWith1, range } from '../util/iter.ts'
import { ValSet, ValMap } from '../util/values.ts'
import { dijkstra } from '../util/graph2.ts';
(async () => {

// const curry = f => x => (...args) => f(x, ...args);
// const spread = f => (args) => f(...args);
// const gather = f => (...args) => f(args);
// const use1st = f => ([x]) => f(x);
// const use2nd = f => ([, x]) => f(x);
// const use3rd = f => ([,, x]) => f(x);

const env = Deno.env()

const input = Array2D.fromString(await read(Deno.stdin));

if (env.DEBUG) console.log('' + input)

const eris = input.map(x => x === '#' ? 1 : 0)

function* solve(eris) {
  for (;;) {
    eris = eris.map((x, p) => {
      const nr = pipe(eris.neighboringValues4(p), sum());
      return x === 1
        ? nr === 1 ? 1 : 0
        : nr === 1 || nr === 2 ? 1 : 0;
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

const seen = new ValSet();
pipe(
  solve(eris),
  zipMap(_ => _.toPointMap()),
  find(([, _]) => hasOrInsert(seen, _)),
  ([_]) => calcBiodiversity(_),
  console.log,
);


})()
