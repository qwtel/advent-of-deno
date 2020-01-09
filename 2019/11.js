#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { add } from '../util/vec2d.ts';
import { wrap } from '../util/other.ts';
import { ValMap } from '../util/values.ts';
import { run } from './intcode.js';
(async () => {

// const env = Deno.env();

const input = (await read())
  .trim()
  .split(',')
  .map(Number);

const dirs = wrap(['^', '>', 'v', '<']);
const dirMap = dir => {
  switch (dir) {
    case '^': return [0, 1];
    case '>': return [1, 0];
    case 'v': return [0, -1];
    case '<': return [-1, 0];
  }
};

function solve(init = []) {
  const painted = new ValMap(init);
  let curr = [0, 0];
  let dir = 0;

  const robot = run(input, [painted.get(curr) === '#' ? 1 : 0]);

  while (true) {
    const col = painted.get(curr);
    const { value: v1 } = robot.next([col === '#' ? 1 : 0]);
    const { value: v2, done } = robot.next();
    if (done) break;

    painted.set(curr, v1 === 1 ? '#' : '.');
    dir += v2 === 0 ? -1 : v2 === 1 ? 1 : 0;
    curr = add(curr, dirMap(dirs[dir]));
  }

  return painted;
}

// 1
console.log(solve().size);

// 2
const painted = solve([[[0, 0], '#']]);

const arr2d = Array2D.fromPointMap(painted, '.');
console.log('' + arr2d.transpose().rotateCCW())

})();
