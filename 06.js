#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, sum } from './util/lilit.ts';
import { makeGraph, bfs } from './util/graph.ts'

const input = await read(Deno.stdin);

const edges = input
  .trim()
  .split('\n')
  .map(line => line.match(/([A-Z0-9]+)\)([A-Z0-9]+)/))
  .map(([, a, b]) => [a, b]);

const { vertices, deps, dirs } = makeGraph(edges);

// 1
const countOrbits = ([v]) => v === 'COM' ? 1 : 1 + countOrbits(deps.get(v));

console.log(pipe(
  deps.values(),
  map(countOrbits),
  sum(),
))

// 2
console.log(bfs({ vertices, dirs, deps, edges }, 'YOU', 'SAN').length - 2)
