#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from '../util/aoc.ts';;
import { skip, flatten, skipWhile, pipe, map, range, permutations, max, grouped, findIndex, minBy, maxBy, zip, product2, filter, unique, count, groupBy, sort, cycle } from '../util/lilit.ts';
import { Array2D } from '../util/array2d.ts';

// import { run } from './05_run.js';

const input = (await read(Deno.stdin))
  .split('\n')
  .map(l => l.split(''))

const x = Array2D.of(input)

const equal = (a, b) => a[0] === b[0] && a[1] === b[1];

const asteroids = pipe(
  x.entries(),
  filter(([p, v]) => v === '#'), 
  map(([p]) => p),
  Array.from,
);

function* foo() {
  for (const currPos of asteroids) {
    const without = asteroids.filter((p) => !equal(p, currPos));
    const angles = [];
    for (const p of without) {
      const dx = currPos[0] - p[0];
      const dy = currPos[1] - p[1];
      angles.push(Math.atan2(dx, dy));
    }
    yield [currPos, pipe(angles, unique(), count())]
  }
}

const [pos, nr] = pipe(foo(), maxBy(([, a], [, b]) => a - b));

console.log(nr)
console.log(pos)
console.log('---')


// 2
const data = pipe(asteroids, 
  filter((p) => !equal(p, pos)),
  groupBy(p => {
    const dx = pos[0] - p[0];
    const dy = pos[1] - p[1];
    return Math.atan2(dx, dy);
  }),
);

pipe(
  data.values(),
  flatten(),
  count(),
  x => console.log('total', x)
)

const manhattanDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);
for (const angle of data.keys()) {
  data.get(angle).sort((p1, p2) => manhattanDist(pos, p1) - manhattanDist(pos, p2));
}

// console.log(pipe(without.keys(), sort(), Array.from));
// console.log(...pipe(sortedAngles, skipWhile(x => x < 0)));

let i = 0;
const sortedAngles = pipe(data.keys(), sort((a, b) => b - a), Array.from);
const ind = sortedAngles.findIndex(x => x === 0);
for (const angle of pipe(cycle(sortedAngles), skip(ind))) {
  // console.log(angle)
  const los = data.get(angle);
  if (los.length) {
    const last = los.shift()
    console.log(`nr:${i+1}:`, angle, last);
    i++;
    if (i === 200) {
      console.log(last[0] * 100 + last[1]);
      break;
    };
  }
}
