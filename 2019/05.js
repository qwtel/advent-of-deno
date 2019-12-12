#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { run } from './05_run.js';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(Number);

console.log(...run(input, 1));
console.log(...run(input, 5));

})();