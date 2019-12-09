#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';;
import { pipe, map, range, permutations, max, grouped, findIndex, minBy, zip, product2 } from './util/lilit.ts';
import { Array2D } from './util/array2d.ts';

import { run } from './05_run.js';

const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(BigInt);

console.log(...run(input, 1));
console.log(...run(input, 2));
