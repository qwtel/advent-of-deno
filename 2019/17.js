#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, neighbors4, bfs } from '../util/array2d.ts'
import { add, addTo, eq, sub, mkNe as notEq } from '../util/vec2d.ts'
import { pipe, filter, map, concat2, first, forEach, sum, toString, toArray, every, last } from '../util/lilit.ts'
import { notIn, notEmpty } from '../util/other.ts'
import { run } from './intcode.js'
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
