#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { wrap, add, arrayCompare, lcm } from '../util/other.ts';
import { ValMap, ValSet } from '../util/values.ts';
import { run } from './05_run.js';
import { pipe, filter, map, toArray, combinations, forEach, zipMap, mapSecond, reduce, constantly, zip, inspect, sum, take, last, find, second, every, range, pluck, first, unzip, unzip3, scan, zip3, nth, subscribe, unzip2, tap, takeWhile, zip2, distinct, distinctUntilChanged, share, zipWith, reducutions } from '../util/lilit.ts';
(async () => {

const abs = (vec) => pipe(vec, map(Math.abs), sum());

const env = Deno.env();

const input = (await read())
  .trim()
  .split('\n')
  .map(l => l.match(/\<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/))
  .map(([, x, y, z]) => [x, y, z].map(Number));

const [xs, ys, zs] = pipe(input, unzip3(), map(toArray()));


function solve(positionsOnAxis) {
  const initialPosVelTuples = [...zip(positionsOnAxis, constantly(0))];
  return pipe(
    range(), 
    scan(posVelTuples => posVelTuples.map(([pos, vel]) => {
      const vel2 = pipe(
        posVelTuples,
        pluck(0),
        filter(p => pos !== p),
        map(p => Math.sign(p - pos)),
        sum(vel),
      );
      return [pos + vel2, vel2];
    }), initialPosVelTuples),
  );
}

// 1
pipe(
  [xs, ys, zs],
  map(axis => pipe(
    solve(axis), 
    take(1000),
    last(), 
    unzip2(),
  )),
  unzip2(),
  ([posXYZ, velXYZ]) => [zip3(...posXYZ), zip3(...velXYZ)],
  ([positions, velocities]) => zip(map(abs)(positions), map(abs)(velocities)),
  map(([pot, kin]) => pot * kin),
  sum(),
  console.log,
);

// 2
pipe(
  [xs, ys, zs],
  map(axis => {
    const seen = new ValSet();
    pipe(
      solve(axis), 
      find((posVelTuples) => seen.hasOrAdd(posVelTuples)),
    );
    return seen.size;
  }),
  periods => lcm(...periods),
  console.log,
);

})();