#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, product2, range, zipMap, find } from '../util/lilit.ts'
import { run } from './intcode.js';
(async () => {


const [first,,, ...rest] = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(Number);

const runWith = (noun, verb) => run([first, noun, verb, ...rest]).next().value;

// 1
console.log(runWith(12, 2));

// 2
pipe(
  product2(range(0, 100), range(0, 100)),
  zipMap(([n, v]) => runWith(n, v)),
  find(([, r]) => r === 19690720),
  ([[noun, verb]]) => console.log(100 * noun + verb),
);

})();