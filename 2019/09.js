#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';;
import { run } from './intcode.js';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(BigInt);

console.log(...run(input, [1]));
console.log(...run(input, [2]));

})();