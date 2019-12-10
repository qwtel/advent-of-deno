#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { fromJS as tuple, Set, List, is } from 'immutable'

import { read } from '../util/aoc.ts';
import { pipe, min, flatMap, map, scan, repeat, takeWhile, sum, count, intoArray } from '../util/lilit.ts'

const intersect = (...xss) => Set.prototype.intersect.call(...map(Set)(xss));

// @ts-ignore
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

const pointAdd = ([x, y], [dx, dy]) => [x + dx, y + dy];

const paths = pipe(
  input,
  map((turns) => pipe(
    turns,
    flatMap(([dir, n]) => repeat(dirMap[dir], n)),
    scan(pointAdd, [0, 0]),
    map(tuple),
    List,
  )),
  intoArray(),
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
  takeWhile(p => !is(p, to)),
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
// class SparseArray2D {
//   constructor() {
//     this.map = new Map().asMutable();
//   }

//   getSet(p, v) {
//     const key = tuple(p);
//     const ov = this.map.get(key);
//     this.map.set(key, v);
//     return ov;
//   }

//   getSetIfEmpty(p, v) {
//     const key = tuple(p);
//     const ov = this.map.get(key);
//     if (ov == null) this.map.set(key, v);
//     return ov;
//   }
// }
//
// function* crossings(input) {
//   const arr2d = new SparseArray2D()
//   for (const [wire, color] of zip2(input, range(1))) {
//     let p = [0, 0];
//     for (const [d, n] of wire) {
//       const dp = dirMap[d];
//       for (let i = 0; i < n; i++) {
//         p = pointAdd(p, dp);
//         const ov = arr2d.getSet(p, color);
//         if (ov && ov !== color) {
//           yield manhattanDist([0, 0], p);
//         }
//       }
//     }
//   }
// }
//
// console.log(pipe(crossings(input), min()));
//
// function* crossings2(input) {
//   const arr2d = new SparseArray2D();
//   for (const [wire, color] of zip2(input, range(1))) {
//     let p = [0, 0];
//     let t = 0;
//     for (const [d, n] of wire) {
//       const dp = dirMap[d];
//       for (let i = 0; i < n; i++) {
//         p = pointAdd(p, dp);
//         t++;
//         const [oc, ot] = arr2d.getSetIfEmpty(p, [color, t]) || [];
//         if (oc && oc !== color) {
//           yield t + ot;
//         }
//       }
//     }
//   }
// }
//
// console.log(pipe(crossings2(input), min()));
