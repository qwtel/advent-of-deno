#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { Array2D, neighbors4, bfs } from '../util/array2d.ts';
import { add, eq, sub, mkNe as notEq } from '../util/vec2d.ts';
import { ValMap } from '../util/values.ts';
import { pipe, filter, concat2, first, last } from '../util/lilit.ts';
import { notIn } from '../util/other.ts'
import { run } from './intcode.js';
(async () => {

const env = Deno.env();

const input = (await read())
  .trim()
  .split(',')
  .map(Number);

function* pop(path) { 
  while (path.length > 0) yield path.pop();
}

const [N, S, W, E] = [1, 2, 3, 4]
const dirMap = { [N]: [0, -1], [S]: [0, 1], [W]: [-1, 0], [E]: [1, 0] }
const dirMapRev = new ValMap(Object.entries(dirMap).map(([k, v]) => [v, k]))

let dir = 1, curr = [0, 0], next, goal;
const channel = [dir];
const droid = run(input, channel);
const world = new ValMap([[curr, '.']]);
const path = [curr];

function debug(curr) {
  console.log('' + Array2D.fromPointMap(world, ' ').map((x, p) => eq(p, curr) ? 'D' : x));
}

for (const response of droid) {
  switch (response) {
    case 2: 
      goal = add(curr, dirMap[dir]);
      // no break
    case 1:
      curr = add(curr, dirMap[dir]);
      world.set(curr, '.');
      path.push(curr);
      break;
    case 0:
      world.set(add(curr, dirMap[dir]), '#');
      break;
  }

  const candidates = concat2(
    pipe(neighbors4(curr), filter(notIn(world))), // neighbors that we haven't explored
    pipe(pop(path), filter(notEq(curr))), // else backtrack + deal with weird edge case
  );
  if (next = pipe(candidates, first())) {
    dir = dirMapRev.get(sub(next, curr));
    channel.push(dir);
  }

  if (env.DEBUG) debug(curr);
}

// 1
world.set(goal, 'X');
const [, shortest, shortestPath] = pipe(bfs(world, [0, 0], 'X', '.'), first());
if (env.DEBUG) console.log(shortestPath);
console.log(shortest);

// 2
world.set(goal, '.');
const [, longest] = pipe(bfs(world, goal, '.', '.'), last());
console.log(longest - 2)

})();