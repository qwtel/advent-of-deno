#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';;
import { pipe, map, maxByKey, filter, unique, count, groupBy, cycle, zipMap, mapValues, skipWhile, toArray, toMap, last, take, inspect, flat, some, filterValues, pluckKeys } from '../util/iter.ts';
import { Array2D } from '../util/array2d.ts';
import { eq, ne, sub } from '../util/vec2d.ts';
import { pad } from '../util/other.ts';
(async () => {

const env = Deno.env();

const arr2d = Array2D.fromString(await read(Deno.stdin));

const asteroids = pipe(
  arr2d.entries(),
  filterValues(v => v === '#'),
  pluckKeys(),
  toArray(),
);

const calcAngle = (p1, p2) => {
  const [dx, dy] = sub(p2, p1);
  return Math.atan2(dy, dx);
}

// 1
const [laserPos, nrOfTargets] = pipe(
  asteroids,
  zipMap((currPos) => pipe(
    asteroids.filter(p => ne(currPos, p)),
    map(p => calcAngle(currPos, p)),
    unique(),
    count(),
  )),
  maxByKey(1),
);
console.log(nrOfTargets);

// 2
if (env.DEBUG) console.log(`Putting laser at [${laserPos.map(pad(2))}]`);

const dist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);
const distToLaser = (p) => dist(laserPos, p);

const nearestByAngle = pipe(
  asteroids.filter(p => ne(laserPos, p)),
  groupBy(p => calcAngle(laserPos, p)),
  mapValues(ps => ps.sort((a, b) => distToLaser(a) - distToLaser(b))),
  toMap(),
);

const anglesClockwise = [...nearestByAngle.keys()].sort((a, b) => a - b);

pipe(
  cycle(anglesClockwise),
  skipWhile(a => a < -Math.PI/2),
  map(a => nearestByAngle.get(a).shift()),
  filter(vaporized => vaporized != null),
  env.DEBUG ? inspect(debug) : _ => _,
  take(Math.min(200, asteroids.length - 2)),
  last(),
  ([x, y]) => x * 100 + y,
  console.log,
);


function debug(removed) { 
  console.log(arr2d.map((_, p) => eq(p, laserPos)
    ? 'X'
    : eq(p, removed)
      ? '@' 
      : pipe(nearestByAngle.values(), flat(), some(a => eq(p, a)))
        ? '#'
        : '.').toString());
};


// Old solution
// {
//   const nearestByAngle = pipe(asteroids, 
//     filter((a) => ne(laserPos, a)),
//     groupBy(a => calcAngle(laserPos, a)),
//   );

//   for (const angle of nearestByAngle.keys()) {
//     nearestByAngle.get(angle).sort((p1, p2) => distToLaser(p1) - distToLaser(p2));
//   }

//   const anglesClockwise = [...nearestByAngle.keys()].sort((a, b) => a - b);

//   let nrVaporized = 0;
//   for (const angle of pipe(cycle(anglesClockwise), skipWhile(a => a < -Math.PI/2))) {
//     const nearest = nearestByAngle.get(angle);
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


})();
