#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D, neighbors4 } from '../util/array2d.ts';
import { add, addTo, eq, sub, mkNe as notEq } from '../util/vec2d.ts';
import { ValMap, ValSet } from '../util/values.ts';
import { pipe, filter, map, concat2, first } from '../util/lilit.ts';
import { notIn, last, notEmpty } from '../util/other.ts'
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

function bfs(world, start, goal) {
  let i = 0;
  const qs = [[[start]], []];
  const seen = new ValSet([start]);

  while (true) {
    const q = qs[i % 2];
    const qNext = qs[(i + 1) % 2];

    const path = q.shift();
    for (const p of neighbors4(last(path))) {
      const v = world.get(p);
      if (v === goal) {
        return [...path, p];
      } else if (v === '.' && !seen.has(p)) {
        qNext.push([...path, p]);
        seen.add(p);
      }
    }

    if (q.length === 0) {
      if (qNext.length !== 0) i++;
      else break;
    }
  }

  // undo last ++
  return i - 1;
}

// 1
world.set(goal, 'X');
const shortest = bfs(world, [0, 0], 'X');
if (env.DEBUG) console.log(shortest);
console.log(shortest.length - 1);

// 2
world.set(goal, '.');
console.log(bfs(world, goal));


})();