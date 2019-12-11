#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { Map, fromJS as tuple } from 'immutable';

import { read } from '../util/aoc.ts';
import { pipe, map, maxByKey, filter, unique, count, groupBy, cycle, zipMap, mapValues, skipWhile, intoArray, intoMap, last, take, inspect, flat, some, forEach, skip, first, mapKeys, constantly, unzip2 } from '../util/lilit.ts';
import { Array2D } from '../util/array2d.ts';
import { eq, ne, sub, add } from '../util/vec2d.ts';
import { pad, mod, arrayCompare } from '../util/other.ts';

const env = Deno.env();

import { run } from './05_run.js';

// @ts-ignore
const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(Number);

const robot = run(input, constantly(1));
const painted = Map([[tuple([0, 0]), '#']]).asMutable();
let curr = [0, 0];
let dir = 0;

const dirs = ['^', '>', 'v', '<'];
const move = (curr, dir) => {
  switch (dir) {
    case '^': return add(curr, [0, 1]);
    case '>': return add(curr, [1, 0]);
    case 'v': return add(curr, [0, -1]);
    case '<': return add(curr, [-1, 0]);
  }
}

for (let i = 0; i < Number.POSITIVE_INFINITY; i++) {
  const col = painted.get(tuple(curr));
  const { value: v1, done: d1 } = robot.next(col === '#' ? constantly(1) : constantly(0));
  if (d1) break;
  const { value: v2, done: d2 } = robot.next();
  if (d2) break;

  if (v1 === 0) {
    painted.set(tuple(curr), '.');
  } else if (v1 === 1) {
    painted.set(tuple(curr), '#');
  }

  if (v2 === 0) {
    dir = mod(dir - 1, 4);
    curr = move(curr, dirs[dir])
  } else if (v2 === 1) {
    dir = (dir + 1) % 4;
    curr = move(curr, dirs[dir])
  }

  // const arr= new Array2D([[-6, -6], [6, 6]])
  // console.log('' + arr.map((x, p) => painted.has(tuple(p)) ? '#' : '.'))
  // console.log(curr, dirs[dir])
  // console.log(...pipe(painted, mapKeys(x => x.join())))
}

const arr= new Array2D([[-25, -20], [60, 20]])
console.log('' + arr.map((x, p) => painted.has(tuple(p)) ? painted.get(tuple(p)) : '.').transpose())