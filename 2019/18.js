#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { ValMap, ValSet } from '../util/values.ts'
import { pipe, filter, map, constantly, grouped, count, find, every, sum, min, range, findIndex, flatMap, flatten, pluck, toArray, minByKey, product, mapValues, toMap, take, forEach, tap, filterValues, filterSecond } from '../util/lilit.ts'
import { Graph } from '../util/graph2.ts'
import { addTo } from '../util/vec2d.ts'
(async () => {

const env = Deno.env();

// Returns the 4 neighbors of point
const last = (arr) => arr[arr.length - 1]
const n4 = (point) => [[0, -1], [0, 1], [-1, 0], [1, 0]].map(addTo(point))
const isLowerCase = x => x.toLowerCase() === x

const input = (await read())
  .trim()
  .split('\n')

const world2d = Array2D.of(input)

if (env.DEBUG) print(world2d.toString())

const poi = pipe(world2d.entries(), filterValues(v => !['.', '#'].includes(v)), Array.from)

function* bfs(world, start, goals) {
  let i = 0
  const qs = [[[start]], []]
  const seen = new ValSet([start])

  while (true) {
    const q = qs[i % 2]
    const qNext = qs[(i + 1) % 2]

    const path = q.shift()
    for (const p of n4(last(path))) {
      const v = world.get(p)
      if (goals.includes(v)) {
        yield [v, i + 1, [...path, p]]
      } else if (v === '.' && !seen.has(p)) {
        qNext.push([...path, p])
        seen.add(p)
      }
    }

    if (q.length === 0) {
      if (qNext.length !== 0) i++
      else break
    }
  }
}

const world = new Graph(pipe(poi, flatMap(([startPos, from]) => {
  const goals = pipe(poi, pluck(1), filter(_ => _ !== from), Array.from)
  return pipe(
    bfs(world2d, startPos, goals),
    map(([to, dist]) => [from, to, dist])
  );
})));

function* reachableKeys(world, currentKey, keysToCollect) {
  const q = [[currentKey, 0]];
  const seen = new Set();

  const isUnlocked = _ => !keysToCollect.has(_.toLowerCase());
  const isUncollected = _ => isLowerCase(_) && keysToCollect.has(_);

  for (const [curr, dist] of q) {
    for (const [, v, d] of world.outgoingEdges(curr)) {
      if (seen.has(v)) continue;
      seen.add(v);
      if (isUncollected(v)) yield [v, dist + d];
      if (isUnlocked(v)) q.push([v, dist + d]);
    }
  }
}

const cache = new ValMap();
const distanceToCollectKeys = (world, currentKey, keysToCollect) => {
  if (keysToCollect.size === 0) return 0;

  const cacheKey = [currentKey, keysToCollect];
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const result = pipe(
    reachableKeys(world, currentKey, keysToCollect),
    map(([key, d]) => d + distanceToCollectKeys(world, key, keysToCollect.clone().remove(key))),
    min(),
  );

  cache.set(cacheKey, result);
  return result;
}

const keysToCollect = new ValSet(pipe(poi, pluck(1), filter(_ => _ !== '@' && isLowerCase(_))));
console.log(distanceToCollectKeys(world, '@', keysToCollect));

})()
