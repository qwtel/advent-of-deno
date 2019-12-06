#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, length, groupedUntilChanged, some, unique, filter, range, map, pairwise, every } from './util/lilit.ts';

// const env = Deno.env();

const [, from, to] = (await read(Deno.stdin))
  .trim()
  .match(/(\d{6})-(\d{6})/)
  .map(Number);

const shared = pipe(
  range(from, to + 1),
  map(n => String(n).split('').map(Number)),
  filter(digits => pipe(digits, pairwise(), every(([a, b]) => b >= a))),
  Array.from,
);

// 1
console.log(pipe(
  shared,
  filter(digits => pipe(digits, unique(), length()) <= 5),
  length(),
));

// 2
console.log(pipe(
  shared,
  filter(digits => pipe(digits, groupedUntilChanged(), some(g => g.length === 2))),
  length(),
));