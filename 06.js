#!/usr/bin/env deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, sum, forEach, unique, flatten, min, filter, pairwise } from './util/lilit.ts';
import { findAndRemove } from './util/other.ts'

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
const neighbors = (v) => [...deps.get(v) || [], ...dirs.get(v) || []]

function dijkstra(vertices, source, target) {
  const q = [];
  const dist = new Map();
  const prev = new Map();

  for (const v of vertices) {
    dist.set(v, Number.POSITIVE_INFINITY);
    prev.set(v, undefined);
    q.push(v);
  }
  dist.set(source, 0);

  while (q.length) {
    // slooooooooooooooooooooow
    const shortest = pipe(q, map(v => dist.get(v)), min());
    const u = findAndRemove(q, v => dist.get(v) === shortest);

    if (u === target) break;

    for (const v of pipe(neighbors(u), filter(v => q.includes(v)))) {
      const alt = dist.get(u) + 1; // length is always 1
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }

  const path = []
  let u = target
  while (u) {
    path.unshift(u);
    u = prev.get(u);
  }

  return [...pipe(path, pairwise())];
}

console.log(dijkstra(vertices, 'YOU', 'SAN').length - 2)
