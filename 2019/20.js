#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, bfs } from '../util/array2d.ts'
import { eq, sub, ne, len } from '../util/vec2d.ts'
import { pipe, min, filter, map, sum, every, flatMap, pluck1, count, zipMap, filterValues, pairwise, first, groupedUntilChanged, startWith, grouped, endWith, combinations3, range, flatten, last, toArray, rangeX, subscribe, some } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap, ValSet, is } from '../util/values.ts'
import { Graph } from '../util/graph2.ts';
import { findAndRemove } from '../util/other.ts';
(async () => {

const env = Deno.env()

let maze = Array2D.fromString(await read());

const aToZ = [...pipe(rangeX('A'.charCodeAt(0), 'Z'.charCodeAt(0)), map(String.fromCharCode))]

const getLabel = (maze, p, x1) => {
  const isConnected = pipe(maze.neighbors4(p), map(_ => maze.get(_)), some(_ => _ === '.'))
  if (isConnected) {
    const [p2, x2] = pipe(maze.neighbors4(p), zipMap(_ => maze.get(_)), filterValues(_ => aToZ.includes(_)), first());
    const label = len(p2) > len(p) ? [x1, x2] : [x2, x1];
    return label.join('');
  }
  return ' ';
}

function compactWorld(world2d) {
  const poi = pipe(world2d.entries(), filterValues(v => !'.# '.includes(v)), toArray());
  return new Graph(pipe(poi, flatMap(([startPos, from]) => {
    const goals = pipe(poi, pluck1(), filter(_ => _ !== from), toArray())
    return pipe(
      bfs(world2d, startPos, goals, '.'),
      map(([to, dist]) => [from, to, dist - 2]), // Accounting for the fact that labels are "outside" the maze
    );
  })));
}

function dijkstraMod(g, source, target) {
  const q = [];
  const dist = new ValMap();
  const prev = new ValMap();

  for (const v of g.vertices) {
    dist.set(v, Number.POSITIVE_INFINITY);
    prev.set(v, undefined);
    q.push(v);
  }
  dist.set(source, 0);

  while (q.length) {
    const shortest = pipe(q, map(_ => dist.get(_)), min());
    const u = findAndRemove(q, v => dist.get(v) === shortest);

    for (const v of g.outgoing(u)) {
      const alt = dist.get(u) + g.weight([u, v]) + 1; // Accounting for the fact that taking a portal takes 1 extra step
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }

    if (u === target) return [u, shortest - 1]; // Removing the extra step from 'ZZ'
  }
}

const labeled = maze.map((x, p) => aToZ.includes(x) ? getLabel(maze, p, x) : x)
const g = compactWorld(labeled)

if (env.DEBUG) console.log('' + labeled);
if (env.DEBUG) console.log(g);

console.log(dijkstraMod(g, 'AA', 'ZZ')[1]);


})()
