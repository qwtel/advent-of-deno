#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { lcm } from '../util/other.ts';
import { pipe, map, toArray, constantly, sum, nth, pluck0, unzip3, scan, zip2, zip3, unzip2, findIndex } from '../util/iter.ts';
import { is } from '../util/values.ts';
(async () => {

const abs = (vec) => pipe(vec, map(Math.abs), sum());

const env = Deno.env();

const input = (await read())
  .trim()
  .split('\n')
  .map(l => l.match(/\<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/))
  .map(([, x, y, z]) => [x, y, z].map(Number));

const [xs, ys, zs] = pipe(input, unzip3(), map(toArray()));

function* solve(positionsOnAxis) {
  let posVelTuples = [...zip2(positionsOnAxis, constantly(0))];
  for (;;) {
    posVelTuples = posVelTuples.map(([pos, vel]) => {
      const vel2 = pipe(
        posVelTuples,
        map(([p]) => Math.sign(p - pos)),
        sum(vel),
      );
      return [pos + vel2, vel2];
    });
    yield posVelTuples;
  }
}

// 1
pipe(
  [xs, ys, zs],
  map(axis => pipe(
    solve(axis), 
    nth(1000),
    unzip2(),
  )),
  unzip2(),
  ([posXYZ, velXYZ]) => [zip3(...posXYZ), zip3(...velXYZ)],
  ([positions, velocities]) => zip2(map(abs)(positions), map(abs)(velocities)),
  map(([pot, kin]) => pot * kin),
  sum(),
  console.log,
);

// 2
pipe(
  [xs, ys, zs],
  map(axis => {
    const states = solve(axis);
    const initial = states.next().value;
    return 1 + pipe(states, findIndex(state => is(state, initial)));
  }),
  periods => lcm(...periods),
  console.log,
);

})();
