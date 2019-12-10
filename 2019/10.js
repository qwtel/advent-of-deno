#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from '../util/aoc.ts';;
import { pipe, map, maxByKey, filter, unique, count, groupBy, cycle, expand, mapValues, skipWhile } from '../util/lilit.ts';
import { Array2D } from '../util/array2d.ts';
import { pad } from '../util/other.ts';

const env = Deno.env();

// @ts-ignore
const input = (await read(Deno.stdin))
  .split('\n')
  .map(l => l.split(''));

const arr2d = Array2D.of(input);

const asteroids = pipe(
  arr2d.entries(),
  filter(([, v]) => v === '#'), 
  map(([p]) => p),
  Array.from,
);

// 1
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
// const add  = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];
// const sub  = ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2];

const calcAngle = (p1, p2) => {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.atan2(dx, dy); // x, y swapped s.t. 0 represents upwards
}

const [laserPos, nrOfTargets] = pipe(
  asteroids,
  expand((currPos) => pipe(
    asteroids.filter((p) => !equal(p, currPos)),
    map(p => calcAngle(currPos, p)),
    unique(),
    count(),
  )),
  maxByKey(1),
);

console.log(nrOfTargets)

// 2
if (env.DEBUG) console.log(`Putting laser at [${laserPos.map(pad(2))}]`);

const manhattanDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);
const distToLaser = (p) => manhattanDist(laserPos, p)

const nearestAsteroidsByAngle = pipe(
  asteroids.filter((p) => !equal(p, laserPos)),
  groupBy(p => calcAngle(laserPos, p)),
  mapValues(ps => ps.sort((p1, p2) => distToLaser(p1) - distToLaser(p2))),
  _ => new Map(_),
);

// Keys sorted in reverse due to angle hack (see `calcAngle`)
const anglesClockwise = [...nearestAsteroidsByAngle.keys()].sort((a, b) => b - a);

let nrVaporized = 0;
for (const angle of pipe(cycle(anglesClockwise), skipWhile(a => a > 0))) {
  const nearestAsteroids = nearestAsteroidsByAngle.get(angle);
  if (nearestAsteroids.length) {
    const vaporized = nearestAsteroids.shift()
    nrVaporized++;
    if (env.DEBUG) console.log(`Vaporized asteroid ${pad(3)(nrVaporized)} [${vaporized.map(pad(2))}] at π ${angle >= 0 ? ' ' : ''}${angle}`);
    if (nrVaporized === 200 || nrVaporized === asteroids.length - 1) {
      console.log(vaporized[0] * 100 + vaporized[1]);
      break;
    };
  }
}
