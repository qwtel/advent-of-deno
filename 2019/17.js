#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts'
import { Array2D, neighbors4 } from '../util/array2d.ts'
import { eq, sub, ne } from '../util/vec2d.ts'
import { pipe, filter, map, sum, every, count, zipMap, filterValues, pairwise, groupedUntilChanged, startWith, grouped, endWith, combinations3, range, flatten, last, toArray } from '../util/iter.ts'
import { run } from './intcode.js'
import { ValMap, ValSet } from '../util/values.ts'
(async () => {

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

const arr2d = Array2D.fromString(pipe(run(input, []), cs => String.fromCharCode(...cs)));

// 1
pipe(
  arr2d.entries(),
  filter(([, x]) => x === '#'),
  filter(([p]) => pipe(neighbors4(p), map(_ => arr2d.get(_)), every(v => v === '#'))),
  map(([[x, y]]) => x * y),
  sum(),
  console.log,
);

// 2
const [N, S, W, E] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const [L, R] = ['L', 'R'];

const turnMap = new ValMap([
  [[N, E], R],
  [[E, S], R],
  [[S, W], R],
  [[W, N], R],
  [[N, W], L],
  [[W, S], L],
  [[S, E], L],
  [[E, N], L],
]);

// A modified 4-grid ~~BFS~~ actually it's not BFS anymore that tries to maintain its direction
// and only changes it when going straight is not an option.
function* modBfs(world, start, goals, obstacles) {
  const q = [[start]];
  while (true) {
    const path = q.shift();
    const [curr, prev] = path;
    const candidates = [...pipe(
      world.neighbors4(curr),
      filter(_ => ne(_, prev)),
      zipMap(_ => world.get(_)),
      filterValues(_ => !obstacles.includes(_))
    )];
    for (const [next, v] of candidates) {
      if (goals.includes(v)) {
        yield [v, [next, ...path]];
      } 
      if (candidates.length === 1) {
        q.push([next, ...path]);
        break;
      } else if (candidates.length === 3 && eq(sub(next, curr), sub(curr, prev))) {
        q.push([next, ...path]);
        break;
      }
    }
    if (q.length === 0) break;
  }
}

const start = arr2d.findPoint(_ => _ === '^');
const [, path] = pipe(modBfs(arr2d, start, '#', '.'), last());

// Building a list of instructions on how to traverse the entire scaffolding of the form `[leftOrRight, nrOfSteps][]`.
// We start with the path returned from the search algorithm and "differentiate" it to get a list of changes.
// We then group them together (e.g. going west 4 times becomes `[W, 4]`).
// Then we look at the groups pairwise (with offset 1) and use the `turnMap`
// to determine whether we need to turn left or right to achieve the desired direction.
const instructions = pipe(
  path.reverse(),
  pairwise(), 
  map(([a, b]) => sub(b, a)), 
  groupedUntilChanged(eq), 
  map(group => [group[0], group.length]), 
  startWith([N, 0]),
  grouped(2, 1),
  map(([[prevDir], [currDir, len]]) => [turnMap.get([prevDir, currDir]), len]),
  toArray(),
);

// Builds a set of all sub-sequences that have an ASCII length of <= 20.
// The sub sequences are strings joined with `,`, e.g. `R,8,L,10`.
// The name dict is in reference to the "words" each sub-sequence represents.
function buildDict(instructions) {
  const dict = new ValSet();
  for (const i of range(1, instructions.length - 1)) {
    for (const seq of pipe(instructions, grouped(i, 1), map(_ => _.join()))) {
      if (seq.length <= 20) {
        dict.add(seq)
      }
    }
  }
  return dict;
}

function solve() {
  // In a language with proper support for values this wouldn't be necessary,
  // but search+replace is much, much easier with strings, so we convert.
  // We still have to use `RegExp` trick to get a 'replace all'...
  const instString = instructions.join();

  const dict = buildDict(instructions)
  for (const [a, b, c] of combinations3(dict)) {
    const main = instString
      .replace(new RegExp(a, 'g'), 'A')
      .replace(new RegExp(b, 'g'), 'B')
      .replace(new RegExp(c, 'g'), 'C');
    if (!main.match(/[LR]/g)) {
      return [main, a, b, c];
    }
  }
}

const NEWLINE = '\n'.charCodeAt(0);

const toASCII = string => pipe(string, map(_ => _.charCodeAt(0)), toArray());

input[0] = 2;

pipe(
  solve(),
  endWith('n'),
  map(toASCII),
  flatten(NEWLINE),
  endWith(NEWLINE),
  _ => run(input, _),
  last(),
  console.log,
);

})()
