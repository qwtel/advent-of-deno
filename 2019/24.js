#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { Array2D, neighbors4 } from '../util/array2d.ts'
import { eq } from '../util/vec2.ts'
import { pipe,  map, find, sum, zipMap, range, sort, first, flatMap, constantly, zip3, distinct, groupBy, nth, toSet, frequencies, filterValues, count, filterMap } from '../util/iter.ts'
import { ValSet } from '../util/values.ts'
(async () => {

// const call = f => (...args) => f(args);
// const apply = f => (args) => f(...args);

const env = Deno.env();

const input = Array2D.fromString(await read(Deno.stdin));

if (env.DEBUG) console.log('' + input);

function* solve(eris) {
  for (;;) {
    eris = eris.map((bug, p) => {
      const nr = pipe(eris.neighboringValues4(p), sum());
      return bug === 1
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

function* solve2(eris) {
  for (let curr = eris, i = 0;; i++) {
    curr = pipe(
      curr,
      flatMap(neighbors4Inf),
      frequencies,
      filterMap(([p, nr]) => curr.has(p)
        ? nr === 1 ? p : null
        : nr === 1 || nr === 2 ? p : null),
      toSet(ValSet),
    );
    if (env.DEBUG && i % 20 === 0) console.log(i);
    yield curr;
  }
}

const eris2 = new ValSet(pipe(
  eris.entries(),
  filterValues(v => v === 1),
  map(([[x, y]]) => [0, x, y]),
));

if (env.PROFILE) console.time('2')
pipe(
  solve2(eris2.remove([0, 2, 2])),
  nth(200),
  count(),
  console.log,
);
if (env.PROFILE) console.timeEnd('2')


function debug(eris) {
  const levels = pipe(eris, map(([level]) => level), distinct(), sort((a, b) => a - b));
  const fieldByLevel = pipe(eris, groupBy(([level]) => level));
  for (const level of levels) {
    const arr2d = pipe(fieldByLevel.get(level), map(([, x, y]) => [[x, y], 1]), _ => Array2D.fromPointMap(_, 0));
    console.log(`Depth ${level}:`);
    console.log('' + arr2d.map((v, p) => eq(p, [2, 2]) ? '?' : v ? '#' : '.'));
  }
}


})()
