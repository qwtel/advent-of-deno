#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { ValMap } from '../util/values.ts';
import { pipe, map, every, sum } from '../util/iter.ts';
import { isIn, ceil } from '../util/other.ts';
import { Graph } from '../util/graph2.ts';
(async () => {

const reactions = (await read())
  .trim()
  .split('\n')
  .map(line => line.split(' => ')
    .map(side => side.split(', ').map(entry => {
      const [n, chem] = entry.split(' ')
      return [Number(n), chem]
    }))
  );

const minIncrements = new ValMap([['ORE', 1]]);
const edges = [];

for (const [ingredients, [[n, result]]] of reactions) {
  minIncrements.set(result, n);
  for (const [m, ingredient] of ingredients) {
    edges.push([result, ingredient, m / n]);
  }
}

// const swap = ([a, b]) => [b, a];
// const minIncrements = new ValMap([
//   ['ORE', 1],
//   ...pipe(reactions, pluck1(), flatten(), map(swap)),
// ])

// const edges = [...pipe(
//   reactions,
//   flatMap(([ingredients, [[n, result]]]) => pipe(
//     ingredients, 
//     map(([m, ingredient]) => [result, ingredient, m / n]),
//   )),
// )];

const g = new Graph(edges);

function solve(nFuel) {
  const bom = new Map([['FUEL', nFuel]]);
  for (const chem of g.walk('FUEL')) {
    const ingredients = [...g.incoming(chem)];
    if (!bom.has(chem) && pipe(ingredients, every(isIn(bom)))) {
      const n = pipe(
        ingredients,
        map(_ => bom.get(_) * g.weight([_, chem])),
        sum(),
        _ => ceil(_, minIncrements.get(chem)),
      );
      bom.set(chem, n);
    }
  }
  return bom.get('ORE');
}

// 1
console.log(solve(1));

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
for (let x = 1; upper <= TARGET; x *= 2) upper = solve(x);
console.log(search(solve, TARGET, [1, upper]));

})();
