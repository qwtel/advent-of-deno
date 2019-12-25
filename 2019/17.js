#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { Array2D, neighbors4 } from '../util/array2d.ts'
import { eq, sub, ne } from '../util/vec2d.ts'
import { pipe, filter, map, sum, toArray, every, count, zipMap, filterValues, pairwise, groupedUntilChanged, startWith, grouped } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap } from '../util/values.ts'
(async () => {

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

const [N, S, W, E] = [[0, -1], [0, 1], [-1, 0], [1, 0]]
// const oppositeDir = new ValMap([[N, S], [S, N], [E, W], [W, E]])

const L = 'L'
const R = 'R'

const turnMap = new ValMap([
  [[N, E], R],
  [[E, S], R],
  [[S, W], R],
  [[W, N], R],
  [[N, W], L],
  [[W, S], L],
  [[S, E], L],
  [[E, N], L],
]);

const arr2d = Array2D.fromString(pipe(run(input), map(String.fromCharCode), Array.from, x => x.join('')))

// 1
pipe(
  arr2d.entries(),
  filter(([, x]) => x === '#'),
  filter(([p]) => pipe(neighbors4(p), map(_ => arr2d.get(_)), every(v => v === '#'))),
  map(([[x, y]]) => x * y),
  sum(),
  console.log,
)

const start = arr2d.findPoint(_ => _ === '^');
const end = arr2d.findPoint((x, p, a) => x === '#' && pipe(a.neighbors4(p), map(_ => a.get(_)), filter(_ => _ !== '.'), count()) === 1);
// console.log(start, end)
arr2d.set(end, 'X')

if (env.DEBUG) console.log(arr2d.toString())

function* modBfs(world, start) {
  const q = [[start]];
  while (true) {
    const path = q.shift();
    const [curr, prev] = path;
    const candidates = [...pipe(
      world.neighbors4(curr),
      filter(_ => ne(_, prev)),
      zipMap(_ => world.get(_)),
      filterValues(_ => _ !== '.')
    )];

    for (const [next, v] of candidates) {
      if (v === 'X') {
        yield [v, [next, ...path]];
      } else if (candidates.length === 1) {
        q.push([next, ...path]);
        break;
      } else if (candidates.length === 3 && eq(sub(next, curr), sub(curr, prev))) {
        q.push([next, ...path]);
        break;
      }
    }

    if (q.length === 0) break;
  }
}

const [[, path]] = modBfs(arr2d, start, [0, -1]);

input[0] = 2;

const instructions = pipe(
  path.reverse(),
  pairwise(), 
  map(([a, b]) => sub(b, a)), 
  groupedUntilChanged(eq), 
  map(group => [group[0], group.length]), 
  startWith([N, -1]),
  grouped(2, 1),
  map(([[prevDir], [currDir, len]]) => [turnMap.get([prevDir, currDir]), len]),
  _ => Array.from(_).join(','),
  // map(_ => _.charCodeAt(0)),
  toArray(),
);

console.log(instructions, instructions.length)
// pipe(String.fromCharCode(...instructions), console.log);


})()
