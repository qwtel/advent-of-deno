#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { Array2D, neighbors4 } from '../util/array2d.ts'
import { eq, sub, ne } from '../util/vec2d.ts'
import { pipe, filter, map, sum, toArray, every, count, zipMap, filterValues, pairwise, groupedUntilChanged, startWith, grouped } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap } from '../util/values.ts'
(async () => {

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

const [N, S, W, E] = [1, 2, 3, 4]
const dirMap = { [N]: [0, -1], [S]: [0, 1], [W]: [-1, 0], [E]: [1, 0] }

const arr2d = Array2D.fromString(pipe(run(input), map(String.fromCharCode), Array.from, x => x.join('')))

if (env.DEBUG) console.log(arr2d.toString())

pipe(
  arr2d.entries(),
  filter(([, x]) => x === '#'),
  filter(([p]) => pipe(neighbors4(p), map(_ => arr2d.get(_)), every(v => v === '#'))),
  map(([[x, y]]) => x * y),
  sum(),
  console.log,
)

// pipe('A,A,B,C,B,C,B,C\n', map(c => c.charCodeAt(0)), toArray(), console.log)

})()
