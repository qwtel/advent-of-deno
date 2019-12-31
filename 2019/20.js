#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, bfs } from '../util/array2d.ts'
import { eq, sub, ne, len } from '../util/vec2d.ts'
import { pipe, min, filter, map, sum, every, flatMap, pluck1, count, zipMap, filterValues, pairwise, first, groupedUntilChanged, startWith, grouped, endWith, combinations3, range, flatten, last, toArray, rangeX, subscribe, some, forEach, mapValues, filterSecond, mapSecond, concat2, take, distinct, reverse } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap, ValSet, is } from '../util/values.ts'
import { Graph, unwind } from '../util/graph2.ts';
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
  const q = [source];
  const dist = new ValMap([[source, 0]]);
  const seen = new ValSet();

  while (q.length) {
    const shortest = pipe(q, map(_ => dist.get(_)), min());
    const u = findAndRemove(q, _ => dist.get(_) === shortest);

    if (u === target) return [u, shortest - 1]; // Removing the extra step from 'ZZ'

    for (const [, v, weight] of g.outgoingEdges(u)) {
      const alt = dist.get(u) + weight + 1; // Accounting for the fact that taking a portal takes 1 extra step
      if (alt < (dist.get(v) || Number.POSITIVE_INFINITY)) {
        dist.set(v, alt);
      }
      if (!seen.has(v)) {
        seen.add(v);
        q.push(v);
      }
    }
  }
}

const labeled = maze.map((x, p) => aToZ.includes(x) ? getLabel(maze, p, x) : x);
const g = compactWorld(labeled);

if (env.DEBUG) console.log('' + labeled);
if (env.DEBUG) console.log(g);

console.log(dijkstraMod(g, 'AA', 'ZZ')[1]);

// 2
function getLabel2(maze, [x, y], v1) {
  const isConnected = pipe(maze.neighbors4([x, y]), map(_ => maze.get(_)), some(_ => _ === '.'))
  if (isConnected) {
    const [p2, v2] = pipe(maze.neighbors4([x, y]), zipMap(_ => maze.get(_)), filterValues(_ => aToZ.includes(_)), first());
    const label = (len(p2) > len([x, y]) ? [v1, v2] : [v2, v1]).join('');
    const isOutside = x <= 2 || x >= maze.lengthX - 3 || y <= 2 || y >= maze.lengthY - 3;
    const marker = isOutside ? ',%,u' : ',%,d'
    return label + (['AA', 'ZZ'].includes(label) ? '' : marker);
  }
  return ' ';
}

const labeled2 = maze.map((x, p) => aToZ.includes(x) ? getLabel2(maze, p, x) : x);
const g2 = compactWorld(labeled2);

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

function dijkstraMod2(g, source, target, debug) {
  const q = [source];
  const dist = new ValMap([[source, 0]]);
  const prev = new ValMap();
  const seen = new ValSet();
  const done = new ValSet();

  while (q.length) {
    const shortest = pipe(q, map(v => dist.get(v)), min());
    const u = findAndRemove(q, v => dist.get(v) === shortest);

    if (u === target) return [u, shortest - 1, unwind(prev, u)]; // Removing the extra step from 'ZZ'

    const uNext = flip(u);
    const level = extractLevel(u);
    const candidates = pipe(
      g.outgoingEdges(uNext),
      filterSecond(v => !done.has(v)),
      filterSecond(v => level === 0 
        ? !v.match(/u/)
        : !v.match(/(AA|ZZ)/)
      ),
      map(([, v, w]) => [buzz(v, level), w]),
    );

    for (const [v, weight] of candidates) {
      const alt = dist.get(u) + weight + 1; // Accounting for the fact that taking a portal takes 1 extra step
      if (alt < (dist.has(v) ? dist.get(v) : Number.POSITIVE_INFINITY)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
      if (!seen.has(v)) {
        seen.add(v);
        q.push(v);
      }
    }

    done.add(u);
  }
}

if (env.DEBUG) console.log('' + labeled2);
if (env.DEBUG) console.log(g2);

print(dijkstraMod2(g2, 'AA', 'ZZ')[1]);

})()
