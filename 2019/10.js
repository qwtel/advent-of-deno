#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';;
import { pipe, map, maxByKey, filter, unique, count, groupBy, cycle, zipMap, mapValues, skipWhile, intoArray, intoMap, last, take, inspect, flat, some, forEach } from '../util/lilit.ts';
import { Array2D } from '../util/array2d.ts';
import { eq, ne, sub } from '../util/vec2d.ts';
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
  intoArray(),
);

// 1

const calcAngle = (p1, p2) => {
  const [dx, dy] = sub(p2, p1);
  return Math.atan2(dy, dx);
}

const [laserPos, nrOfTargets] = pipe(
  asteroids,
  zipMap((currPos) => pipe(
    asteroids.filter(a => ne(currPos, a)),
    map(a => calcAngle(currPos, a)),
    unique(),
    count(),
  )),
  maxByKey(1)
);
console.log(nrOfTargets)

// 2
const print = (removed) => console.log(
  arr2d.map((_, p) => eq(p, laserPos)
    ? 'X'
    : eq(p, removed)
      ? '@' 
      : pipe(nearestByAngle.values(), flat(), some(a => eq(p, a)))
        ? '#'
        : '.').toString()
);

// const [laserPos, nrOfTargets] = [[8, 3], -1];
if (env.DEBUG) console.log(`Putting laser at [${laserPos.map(pad(2))}]`);

const dist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);
const distToLaser = (p) => dist(laserPos, p)

const nearestByAngle = pipe(
  asteroids.filter(a => ne(laserPos, a)),
  groupBy(a => calcAngle(laserPos, a)),
  mapValues(ps => ps.sort((p1, p2) => distToLaser(p1) - distToLaser(p2))),
  intoMap(),
);

const anglesClockwise = [...nearestByAngle.keys()].sort((a, b) => a - b);

pipe(
  cycle(anglesClockwise),
  skipWhile(a => a < -Math.PI/2),
  map(angle => nearestByAngle.get(angle)),
  filter(nearest => nearest.length),
  map(nearest => nearest.shift()),
  env.DEBUG && inspect(print),
  take(Math.min(200, asteroids.length - 2)),
  last(),
  p => console.log(p[0] * 100 + p[1])
);

// Old solution
// {
//   const nearestByAngle2 = pipe(asteroids, 
//     filter((a) => ne(laserPos, a)),
//     groupBy(a => calcAngle(laserPos, a)),
//   );

//   for (const angle of nearestByAngle2.keys()) {
//     nearestByAngle2.get(angle).sort((p1, p2) => distToLaser(p1) - distToLaser(p2));
//   }

//   let nrVaporized = 0;
//   for (const angle of pipe(cycle(anglesClockwise), skipWhile(a => a < -Math.PI/2))) {
//     const nearest = nearestByAngle2.get(angle);
//     if (nearest.length) {
//       const vaporized = nearest.shift();
//       nrVaporized++;
//       if (env.DEBUG) console.log(`Vaporized asteroid ${pad(3)(nrVaporized)} [${vaporized.map(pad(2))}] at π ${angle >= 0 ? ' ' : ''}${angle}`);
//       if (nrVaporized === 200 || nrVaporized === asteroids.length - 2) {
//         console.log(vaporized[0] * 100 + vaporized[1]);
//         break;
//       };
//     }
//   }
// }
