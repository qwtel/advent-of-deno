#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read, print } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { ValMap } from '../util/values.ts';
import { pipe, filter, map, constantly, grouped, count, find, every, sum, min } from '../util/lilit.ts';
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
const nearestMultiple = (n, minIncrement) => Math.ceil(n / minIncrement) * minIncrement

const minIncrements = new ValMap([['ORE', 1]]);
const graphData = [];
for (const [lhs, [[n1, chem1]]] of reactions) {
  minIncrements.set(chem1, n1)
  for (const [n2, chem2] of lhs) {
    graphData.push([chem1, chem2, n2 / n1])
  }
}

const g = makeGraph(graphData);

const done = new Map([['FUEL', 1]]);
const queue = ['FUEL'];
for (const curr of queue) {
  for (const chem of outgoing(g, curr)) {
    queue.push(chem)

    const allDepsDone = pipe(incoming(g, chem), every(isIn(done)))
    if (!done.has(chem) && allDepsDone) {
      const n = pipe(
        incoming(g, chem),
        map(c => done.get(c) * weight(g, [c, chem])),
        sum(),
      );
      done.set(chem, nearestMultiple(n, minIncrements.get(chem)))
    }
  }
}
console.log(done.get('ORE'))

})();
