#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, neighbors4, neighbors8 } from '../util/array2d.ts'
import { ValMap, ValSet } from '../util/values.ts'
import { pipe, filter, map, constantly, grouped, count, find, every, sum, min, range, rangeX, findIndex, flatMap, flatten, pluck, toArray, minByKey, product, mapValues, toMap, take, forEach, tap, filterValues, filterSecond, product2, combinations, combinations2, permutations, permutations2 } from '../util/lilit.ts'
import { Graph } from '../util/graph2.ts'
import { addTo, mkNe, add } from '../util/vec2d.ts'
import { last } from '../util/other.ts'
(async () => {

const env = Deno.env();

const isLowerCase = x => x.toLowerCase() === x;

const world2d = Array2D.fromString(await read())

if (env.DEBUG) print(world2d.toString())

// TODO: make general array2d bfs...
function* bfs(world, start, goals) {
  let i = 0
  const qs = [[[start]], []]
  const seen = new ValSet([start])

  while (true) {
    const q = qs[i % 2]
    const qNext = qs[(i + 1) % 2]

    const path = q.shift()
    for (const p of neighbors4(last(path))) {
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

// Takes a 2d representation, extracts the points of interest (everything that's not a wall `#` or path `.`)
// and builds a graph of the shortest paths between them.
function compactWorld(world2D) {
  const poi = pipe(world2d.entries(), filterValues(v => !['.', '#'].includes(v)), Array.from)
  return new Graph(pipe(poi, flatMap(([startPos, from]) => {
    const goals = pipe(poi, pluck(1), filter(_ => _ !== from), Array.from)
    return pipe(
      bfs(world2d, startPos, goals),
      map(([to, dist]) => [from, to, dist])
    );
  })));
}

// Basically BFS, but over our compacted graph.
// Takes into account the key unlock-door logic.
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
const distanceToCollectKeys = (world, currentKeys, keysToCollect) => {
  if (keysToCollect.size === 0) return 0;

  const cacheKey = [currentKeys, keysToCollect];
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let result = Number.POSITIVE_INFINITY;
  for (const [i, currentKey] of currentKeys.entries()) {
    result = Math.min(result, pipe(
      reachableKeys(world, currentKey, keysToCollect),
      map(([key, d]) => {
        const currentKeysNext = [...currentKeys]
        currentKeysNext[i] = key;

        const keysToCollectNext = keysToCollect.clone().remove(key);

        return d + distanceToCollectKeys(world, currentKeysNext, keysToCollectNext);
      }),
      min(),
    ));
  }

  cache.set(cacheKey, result);
  return result;
}

const world = compactWorld(world2d);
const keysToCollect = new ValSet(pipe(world.vertices, filter(_ => _ !== '@' && isLowerCase(_))));
console.log(distanceToCollectKeys(world, ['@'], keysToCollect));

// 2
const pattern = Array2D.fromString(`
@#$
###
%#&`, [[-1, -1], [2, 2]]);

const p = world2d.findPoint(x => x === '@');
for (const dp of [[0, 0], ...neighbors8()]) {
  world2d.set(add(p, dp), pattern.get(dp));
}

if (env.DEBUG) console.log('' + world2d)

const world2 = compactWorld(world2d);
console.log(distanceToCollectKeys(world2, ['@', '$', '%', '&'], keysToCollect));


})()
