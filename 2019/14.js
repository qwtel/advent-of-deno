#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { ValMap } from '../util/values.ts';
import { pipe, filter, map, constantly, grouped, count, find, every, sum, min, range, findIndex } from '../util/lilit.ts';
import { run } from './intcode.js';
import { makeGraph, incoming, outgoing, weight } from '../util/graph.ts';
(async () => {

const reactions = (await read())
  .trim()
  .split('\n')
  .map(line => line.split(' => ')
    .map(side => side.split(', ').map(entry => {
      const [n, chem] = entry.split(' ');
      return [Number(n), chem];
    }))
  );

const isIn = (set) => (v) => set.has(v)
const nextMultiple = (n, minIncrement) => Math.ceil(n / minIncrement) * minIncrement

const minIncrements = new ValMap([['ORE', 1]]);
const graphData = [];
for (const [lhs, [[n1, chem1]]] of reactions) {
  minIncrements.set(chem1, n1)
  for (const [n2, chem2] of lhs) {
    graphData.push([chem1, chem2, n2 / n1])
  }
}
const g = makeGraph(graphData);

function solve(nFuel) {
  const done = new Map([['FUEL', nFuel]]);
  const queue = ['FUEL'];
  for (const curr of queue) {
    for (const chem of outgoing(g, curr)) {
      queue.push(chem)

      const allDepsDone = pipe(incoming(g, chem), every(isIn(done)))
      if (!done.has(chem) && allDepsDone) {
        const n = pipe(
          incoming(g, chem),
          map(_ => done.get(_) * weight(g, [_, chem])),
          sum(),
          _ => nextMultiple(_, minIncrements.get(chem)),
        );
        done.set(chem, n)
      }
    }
  }
  return done.get('ORE')
}

// 1
console.log(solve(1))

// 2
function search(f, target, [min, max]) {
  const middle = Math.floor((min + max) / 2);
  if (min === middle) return middle;
  const y = f(middle);
  if (y > target) return search(f, target, [min, middle]);
  if (y < target) return search(f, target, [middle, max]);
  return middle;
}

const TARGET = 1000000000000;
let upper = 0;
for(let x = 1; upper <= TARGET; x *= 2) upper = solve(x)
console.log(search(solve, TARGET, [1, upper]))

})();
