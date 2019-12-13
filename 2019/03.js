#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { fromJS, Set as ISet, List as IList } from 'immutable'
import { read } from '../util/aoc.ts';
import { pipe, min, flatMap, map, scan, repeat, takeWhile, sum, count, share, zip2, range } from '../util/lilit.ts'
import { ne, add } from '../util/vec2d.ts';
import { ValMap } from '../util/values.ts';
(async () => {

const intersect = (...xss) => ISet.prototype.intersect.call(...map(ISet)(xss));

const input = (await read(Deno.stdin))
  .trim()
  .split('\n')
  .map(line => line.split(',')
    .map(s => s.match(/([URDL])(\d+)/i))
    .map(([, d, n]) => [d, Number(n)])
  );

const dirMap = {
  U: [0, 1],
  R: [1, 0],
  D: [0, -1],
  L: [-1, 0],
};

const paths = pipe(
  input,
  map((turns) => pipe(
    turns,
    flatMap(([dir, n]) => repeat(dirMap[dir], n)),
    scan(add, [0, 0]),
    map(fromJS),
    IList,
  )),
  share(),
);

// 1
const manhattanDist = ([ax, ay], [bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by);

pipe(
  intersect(...paths),
  map(inter => manhattanDist([0, 0], inter)),
  min(),
  console.log,
);

// 2
const signalDelay = (path, to) => 1 + pipe(
  path,
  takeWhile(p => ne(p, to)),
  count(),
);

pipe(
  intersect(...paths),
  map(inter => pipe(
    paths.filter(path => path.includes(inter)),
    map(path => signalDelay(path, inter)),
    sum(),
  )),
  min(),
  console.log,
);

// Old solution
// function* crossings(input, f) {
//   const arr2d = new ValMap()
//   for (const [wire, color] of zip2(input, range(1))) {
//     let p = [0, 0];
//     for (const [d, n] of wire) {
//       for (let i = 0; i < n; i++) {
//         p = add(p, dirMap[d]);
//         const ov = arr2d.get(p);
//         arr2d.set(p, color);
//         if (ov && ov !== color) {
//           yield manhattanDist([0, 0], p);
//         }
//       }
//     }
//   }
// }

// console.log(pipe(crossings(input), min()));

// function* crossings2(input) {
//   const arr2d = new ValMap();
//   for (const [wire, color] of zip2(input, range(1))) {
//     let p = [0, 0];
//     let t = 0;
//     for (const [d, n] of wire) {
//       for (let i = 0; i < n; i++) {
//         p = add(p, dirMap[d]);
//         t++;
//         const [oc, ot] = arr2d.get(p) || [];
//         if (!oc) arr2d.set(p, [color, t]);
//         if (oc && oc !== color) {
//           yield t + ot;
//         }
//       }
//     }
//   }
// }

// console.log(pipe(crossings2(input), min()));

})();