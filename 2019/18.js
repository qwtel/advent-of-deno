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

if (env.DEBUG) print(world2d.toString())

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

const set = (a, i, v) => { a[i] = v; return a };

const cache = new ValMap();
const distanceToCollectKeys = (world, currentKeys, keysToCollect) => {
  if (keysToCollect.size === 0) return 0;

  const cacheKey = [currentKeys, keysToCollect];
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const result = pipe(
    currentKeys.entries(),
    map(([i, currentKey]) => pipe(
      reachableKeys(world, currentKey, keysToCollect),
      map(([key, d]) => {
        const currentKeysNext = set([...currentKeys], i, key);
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
