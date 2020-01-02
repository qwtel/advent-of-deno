#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { ValMap, ValSet } from '../util/values.ts'
import { pipe, filter, map, min, rangeX, product2 } from '../util/iter.ts'
import { add } from '../util/vec2.ts'
(async () => {

const env = Deno.env();

const isLowerCase = x => x.toLowerCase() === x;

const world2d = Array2D.fromString(await read())

if (env.DEBUG) console.log('' + world2d)

// Basically BFS, but over our compacted graph (shortest distances between points of interest).
// Takes into account the key unlock-door logic.
function* reachableKeys(world, position, keysToCollect) {
  const q = [[position, 0]];
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

const set = (a, i, v) => { a[i] = v; return a };

const cache = new ValMap();

// Given a set of current positions and a set of keys to collect, returns the minimum distance to collect them all.
// `positions`, is an array of positions of each actor (1 for part 1, and 4 for part 2), 
// where the position is a node in the compacted graph, i.e. either a starting position or the location of a key.
const distanceToCollectKeys = (world, positions, keysToCollect) => {
  if (keysToCollect.size === 0) return 0;

  const cacheKey = [positions, keysToCollect];
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const result = pipe(
    positions.entries(),
    map(([i, currentKey]) => pipe(
      reachableKeys(world, currentKey, keysToCollect),
      map(([key, d]) => {
        // For each key we recurse with the actor `i` in the position of reachable key `key`,
        // and `key` removed from `keysToCollect`.
        const currentKeysNext = set([...positions], i, key);
        const keysToCollectNext = keysToCollect.clone().remove(key);
        return d + distanceToCollectKeys(world, currentKeysNext, keysToCollectNext);
      }),
      min(),
    )),
    min(),
  );

  cache.set(cacheKey, result);
  return result;
}

const poi = new ValSet(pipe(world2d, filter(v => !'.#'.includes(v))));
const g = world2d.compactWorld(poi, '.');
const keysToCollect = new ValSet(pipe(g.vertices, filter(_ => _ !== '@' && isLowerCase(_))));
console.log(distanceToCollectKeys(g, ['@'], keysToCollect));

// 2
const pattern = Array2D.fromString(`
@#$
###
%#&`.trim(), [[-1, -1], [2, 2]]);

const p = world2d.findPoint(x => x === '@');
for (const dp of product2(rangeX(-1, 1), rangeX(-1, 1))) {
  world2d.set(add(p, dp), pattern.get(dp));
}

if (env.DEBUG) console.log('' + world2d);

const g2 = world2d.compactWorld([...poi, '$', '%', '&'], '.');
console.log(distanceToCollectKeys(g2, ['@', '$', '%', '&'], keysToCollect));


})()
