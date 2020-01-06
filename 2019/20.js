#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { len } from '../util/vec2.ts'
import { pipe, filter, map, rangeX, some, filterSecond, find } from '../util/iter.ts'
import { ValSet } from '../util/values.ts'
import { dijkstra } from '../util/graph2.ts';
(async () => {

const env = Deno.env()

const maze = Array2D.fromString(await read());

const A_Z = new Set(pipe(rangeX('A'.charCodeAt(0), 'Z'.charCodeAt(0)), map(String.fromCharCode)));

const fixLabels = (v, p, maze) => {
  if (!A_Z.has(v)) return v;
  if (pipe(maze.neighboringValues4(p), some(_ => _ === '.'))) {
    const [p2, v2] = pipe(maze.neighboringEntries4(p), find(([, v]) => A_Z.has(v)));
    const label = len(p2) > len(p) ? [v, v2] : [v2, v];
    return label.join('');
  }
  return '';
}

// Subtracting 2 because labels are "outside" the maze, increasing the distance between them by 2.
// Adding 1 because taking a portal takes 1 extra step.
const adjustWeight = ([u, v, w]) => [u, v, w - 2 + 1];

const dijkstra1 = (g, source, target) => dijkstra(g, source, target, (g, u) => pipe(
  g.outgoingEdges(u),
  map(adjustWeight),
))

const labeled = maze.map(fixLabels);
const poi = new ValSet(pipe(labeled, filter(v => !'. #'.includes(v))));
const g = labeled.compactWorld(poi, '.')

if (env.DEBUG) console.log('' + labeled);
if (env.DEBUG) console.log(g);

console.log(dijkstra1(g, 'AA', 'ZZ')[1] - 1); // Removing the extra step from 'ZZ'

// 2

const U = 'u';
const D = 'd';

function fixLabels2(v1, [x, y], maze) {
  const label = fixLabels(v1, [x, y], maze);
  if (!label || label === v1) return [label];
  const isOutside = x <= 2 || x >= maze.lengthX - 3 || y <= 2 || y >= maze.lengthY - 3;
  return [label, ...['AA', 'ZZ'].includes(label) ? [] : [isOutside ? U : D]];
}

const flip = ([lbl, dir]) => {
  if (dir === D) return [lbl, U];
  if (dir === U) return [lbl, D];
  return [lbl];
}

const getLevel = ([, dir, lvl]) => {
  if (dir === D) return lvl + 1; // if we went through a down-portal the level is +1
  if (dir === U) return lvl;
  return 0;
}

const addLevel = ([lbl, dir], lvl) => {
  if (dir === D) return [lbl, dir, lvl];
  if (dir === U) return [lbl, dir, lvl - 1]; // the portal is an up-portal, the level is -1
  return [lbl];
}

const dijkstra2 = (g, source, target) => dijkstra(g, source, target, (g, u) => {
  const [uFlipped, level] = [flip(u), getLevel(u)];
  return pipe(
    g.outgoingEdges(uFlipped), // get all outgoing edges from the other side of portal `u`
    filterSecond(([v, dir]) => level === 0
      ? dir !== U // hide up-portals on level 0
      : !['AA', 'ZZ'].includes(v) // hide AA and ZZ portals on all other levels
    ),
    map(([u, v, w]) => [u, addLevel(v, level), w]),
    map(adjustWeight),
  );
})

const labeled2 = maze.map(fixLabels2);
const poi2 = new ValSet(pipe(labeled2, filter(([v]) => !'. #'.includes(v))));
const g2 = labeled2.compactWorld(poi2, [['.']]);

if (env.DEBUG) console.log('' + labeled2);
if (env.DEBUG) print(g2);

console.log(dijkstra2(g2, ['AA'], ['ZZ'])[1] - 1); // Removing the extra step from 'ZZ'

})()
