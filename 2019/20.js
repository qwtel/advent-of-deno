#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, bfs } from '../util/array2d.ts'
import { eq, sub, ne, len } from '../util/vec2d.ts'
import { pipe, min, filter, map, sum, every, flatMap, pluck1, count, zipMap, filterValues, pairwise, first, groupedUntilChanged, startWith, grouped, endWith, combinations3, range, flatten, last, toArray, rangeX, subscribe, some, forEach, mapValues, filterSecond, mapSecond, concat2, take, distinct, reverse, find } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap, ValSet, is } from '../util/values.ts'
import { Graph, dijkstra } from '../util/graph2.ts';
import { findAndRemove } from '../util/other.ts';
(async () => {

const env = Deno.env()

const maze = Array2D.fromString(await read());

const aToZ = new Set(pipe(rangeX('A'.charCodeAt(0), 'Z'.charCodeAt(0)), map(String.fromCharCode)));

const fixLabels = (v, p, maze) => {
  if (!aToZ.has(v)) return v;
  if (pipe(maze.neighboringValues4(p), some(_ => _ === '.'))) {
    const [p_, v_] = pipe(maze.neighboringEntries4(p), find(([, v]) => aToZ.has(v)));
    const label = len(p_) > len(p) ? [v, v_] : [v_, v];
    return label.join('');
  }
  return '';
}

// Subtracting 2 because labels are "outside" the maze, increasing the distance between them by 2.
// Adding 1 because taking a portal takes 1 extra step.
const adjustWeight = ([u, v, w]) => [u, v, w - 2 + 1];

const dijkstra1 = (g, source, target) => dijkstra(g,source, target, (g, u) => pipe(
  g.outgoingEdges(u),
  map(adjustWeight),
))

const labeled = maze.map(fixLabels);
const poi = pipe(labeled.values(), filter(v => !'. #'.includes(v)));
const g = labeled.compactWorld(poi, '.')

if (env.DEBUG) console.log('' + labeled);
if (env.DEBUG) console.log(g);

console.log(dijkstra1(g, 'AA', 'ZZ')[1] - 1); // Removing the extra step from 'ZZ'

// 2
function fixLabels2(v1, [x, y], maze) {
  const label = fixLabels(v1, [x, y], maze);
  if (label === v1) return v1;
  if (label) {
    const isOutside = x <= 2 || x >= maze.lengthX - 3 || y <= 2 || y >= maze.lengthY - 3;
    const marker = isOutside ? ',%,u' : ',%,d'
    return label + (['AA', 'ZZ'].includes(label) ? '' : marker);
  }
  return '';
}

const extractLevel = u => {
  const [num] = u.match(/\d+/)  || [];
  const [dir] = u.match(/[ud]/) || [];
  switch (dir) { 
    case 'd': return Number(num) + 1;
    case 'u': return Number(num);
    default: return 0;
  }
}

const flip = (v) => {
  if (v.match(/d/)) return v.replace(/d/, 'u').replace(/\d+/, '%');
  else if (v.match(/u/)) return v.replace(/u/, 'd').replace(/\d+/, '%');
  return v;
}

const buzz = (v, level) => {
  if (v.match(/d/)) return v.replace(/%/, level);
  else if (v.match(/u/)) return v.replace(/%/, level - 1);
  return v;
}

const dijkstra2 = (g, source, target) => dijkstra(g, source, target, (g, u) => {
  const u_ = flip(u);
  const level = extractLevel(u);
  return pipe(
    g.outgoingEdges(u_),
    filterSecond(v => level === 0
      ? !v.match(/u/)
      : !v.match(/(AA|ZZ)/)
    ),
    map(([u, v, w]) => [u, buzz(v, level), w]),
    map(adjustWeight),
  );
})

const labeled2 = maze.map(fixLabels2);
const poi2 = pipe(labeled2.values(), filter(v => !'. #'.includes(v)));
const g2 = labeled2.compactWorld(poi2, '.');

if (env.DEBUG) console.log('' + labeled2);
if (env.DEBUG) console.log(g2);

print(dijkstra2(g2, 'AA', 'ZZ')[1] - 1); // Removing the extra step from 'ZZ'

})()
