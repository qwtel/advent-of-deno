#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { Array2D } from '../util/array2d.ts'
import { pipe, filter, map, count, range, findIndex, product2, takeWhile, findLast, findLastIndex, toArray, flatten, endWith, last } from '../util/iter.ts'
import { run } from './intcode.js'
(async () => {

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

const mkProgram = str => pipe(
  str.trim().split('\n'), 
  filter(line => !line.startsWith('//') && line.trim() !== ''), 
  flatten('\n'),
  endWith('\n'),
  map(_ => _.charCodeAt(0)),
  toArray()
)

const program = mkProgram(`
NOT C J
AND D J
NOT A T
OR T J
WALK`)

if (env.DEBUG) console.log(String.fromCharCode(...run(input, program)));
pipe(run(input, program), last(), console.log);

const program2 = mkProgram(`
NOT C J
AND D J
AND H J
NOT A T
AND D T
OR T J
NOT B T
AND D T
OR T J
RUN`)

if (env.DEBUG) console.log(String.fromCharCode(...run(input, program2)));
pipe(run(input, program2), last(), console.log);

})()
