#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, map, sum } from '../util/lilit.ts';
import { makeGraph, bfs } from '../util/graph.ts';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split('\n');

const edges = input
  .map(line => line.match(/([A-Z0-9]+)\)([A-Z0-9]+)/))
  .map(([, a, b]) => [a, b]);

const { vertices, deps, dirs } = makeGraph(edges);

// 1
const countOrbits = ([v]) => v === 'COM' ? 1 : 1 + countOrbits(deps.get(v));

pipe(
  deps.values(),
  map(countOrbits),
  sum(),
  console.log,
);

// 2
console.log(bfs({ vertices, dirs, deps }, 'YOU', 'SAN').length - 2)

})();