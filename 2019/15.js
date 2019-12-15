#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { add, eq } from '../util/vec2d.ts';
import { ValMap, ValSet } from '../util/values.ts';
import { pipe, filter, map, constantly, grouped, count, forEach, filterMap } from '../util/lilit.ts';
import { run } from './intcode.js';
import { wrap, getRandomInteger } from '../util/other.ts';
(async () => {

const env = Deno.env();

const input = (await read())
  .trim()
  .split(',')
  .map(Number);

// 1
const [N, S, W, E] = [1, 2, 3, 4]
const dirMap = {
  [N]: [0, -1],
  [S]: [0, 1],
  [W]: [-1, 0],
  [E]: [1, 0],
}

let dir = getRandomInteger(1, 4);
const q = [dir]
const droid = run(input, q)
let curr = [0, 0];
const world = new ValMap([[curr, '.']]);

outer: for (;;) {
  const { value } = droid.next();

  switch (value) {
    case 0: {
      world.set(add(curr, dirMap[dir]), '#');
      break;
    }
    case 1: {
      curr = add(curr, dirMap[dir]);
      world.set(curr, '.')
      break;
    }
    case 2: {
      curr = add(curr, dirMap[dir]);
      break outer;
    }
    default: {
      throw Error(value)
    }
  }
  dir = getRandomInteger(1, 4);
  q.push(dir)
}

debug(curr);

function debug(curr) {
  console.log('' + Array2D.fromPointMap(world, ' ').map((x, p) => eq(p, curr) ? 'D' : x));
}

function neighbors4(grid, p) {
  return pipe(
    [[0, -1], [1, 0], [-1, 0], [0, 1]],
    map(_ => add(p, _)),
    filter(_ => grid.isInside(_)),
  );
}

function bfs(world, start, goal) {
  const queue = [wrap([start])];
  const seen = new ValSet([start]);
  while (queue.length) {
    const path = queue.shift();
    for (const n of neighbors4(world, path[-1])) {
      const v = world.get(n);
      if (v === goal) {
        return [...path, n];
      } else if (v === '.' && !seen.has(n)) {
        queue.push(wrap([...path, n]));
        seen.add(n);
      }
    }
  }
}

const arr2d = Array2D.fromPointMap(world, ' ');
arr2d.set([0, 0], 'X')
const path = bfs(arr2d, curr, 'X')
console.log(path.length - 1)


})();