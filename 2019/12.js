#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { wrap, add, arrayCompare, lcm } from '../util/other.ts';
import { ValMap, ValSet } from '../util/values.ts';
import { run } from './05_run.js';
import { pipe, filter, map, toArray, combinations, forEach, zipMap, mapSecond, reduce, constantly, zip, inspect, sum, take, last, find, second, every, range, pluck, first, unzip, unzip3, scan, zip3, nth, subscribe, unzip2, tap, takeWhile, zip2, distinct, distinctUntilChanged, share, zipWith } from '../util/lilit.ts';
(async () => {

const env = Deno.env();

const input = (await read())
  .trim()
  .split('\n')
  .map(l => l.match(/\<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/))
  .map(([, x, y, z]) => [x, y, z].map(Number));

const [xs, ys, zs] = pipe(input, unzip3(), map(toArray()));

function solve(axis) {
  const initialPosVel = [...zip(axis, constantly(0))];
  return pipe(
    constantly(),
    scan(posVel => pipe(
      posVel,
      map(([pos, vel]) => {
        const others = pipe(posVel, pluck(0), filter(p => pos !== p));
        const newVel = pipe(others, map(p => Math.sign(p - pos)), sum(vel));
        return [pos + newVel, newVel];
      }),
      share(),
    ), initialPosVel),
  )
}

// 1
const [[xPos, xVel], [yPos, yVel], [zPos, zVel]] = pipe(
  [xs, ys, zs],
  map(axis => pipe(
    solve(axis), 
    take(1000),
    last(), 
    unzip2(),
  )),
);

const positions = zip3(xPos, yPos, zPos);
const velocities = zip3(xVel, yVel, zVel);

const abs = (vec) => pipe(vec, map(Math.abs), sum());
const pot = map(abs)(positions);
const kin = map(abs)(velocities);

pipe(
  zip(pot, kin),
  map(([p, k]) => p * k),
  sum(),
  console.log,
);

// 2
pipe(
  [xs, ys, zs],
  map(axis => {
    const seen = new ValSet();
    pipe(solve(axis), find((posVel) => seen.hasOrAdd(posVel)));
    return seen.size;
  }),
  ([xPeriod, yPeriod, zPeriod]) => lcm(xPeriod, yPeriod, zPeriod),
  console.log,
);

})();