#!/usr/bin/env deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, flatten, unique, map, sum } from './util/lilit.ts';
import { bfs } from './util/graph.ts'

const input = await read(Deno.stdin);

const edges = input
    .trim()
    .split('\n')
    .map(line => line.match(/([A-Z0-9]+)\)([A-Z0-9]+)/))
    .map(([, a, b]) => [a, b])

const vertices = [...pipe(edges, flatten(), unique())]
  
// Representing the graph as two maps,
// one for forward direction (dir) and one for backward direction (deps).
const dirs = new Map();
const deps = new Map();
for (const [a, b] of edges) {
  dirs.set(a, (dirs.get(a) || []).concat(b).sort());
  deps.set(b, (deps.get(b) || []).concat(a).sort());
}

// 1
const countOrbits = ([v]) => v === 'COM' ? 1 : 1 + countOrbits(deps.get(v));

console.log(pipe(
  deps.values(),
  map(countOrbits),
  sum(),
))

// 2
console.log(bfs({ vertices, dirs, deps }, 'YOU', 'SAN').length - 2)
