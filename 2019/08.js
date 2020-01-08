#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';;
import { pipe, zipMap, range, grouped, minByKey, zip2, toArray, groupedUntilChanged, forEach, map, reverse, flatten, toSet, filterValues, toMap } from '../util/iter.ts';
import { Array2D } from '../util/array2d.ts';
import { ValSet, ValMap } from '../util/values.ts';
(async () => {

const input = (await read(Deno.stdin))
  .trim()
  .split('')
  .map(Number);

const width = 25;
const height = 6;

const layers = pipe(
  input,
  grouped(width * height),
  toArray(),
)

// 1
pipe(
  layers,
  zipMap(layer => layer.filter(p => p === 0).length),
  minByKey(1),
  ([layer]) => layer.filter(p => p === 1).length * layer.filter(p => p === 2).length,
  console.log,
)

// 2
pipe(
  layers,
  map(layer => pipe(layer, grouped(width), toArray())),
  map(Array2D.of),
  map(_ => _.entries()),
  map(filterValues(_ => _ !== 2)),
  reverse(),
  flatten(),
  Array2D.fromPointMap,
  _ => console.log('' + _.map(x => x === 1 ? '#' : ' ')),
)

})();
