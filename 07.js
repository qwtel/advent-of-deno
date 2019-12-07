#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, grouped, forEach, product, productN, range, permutations, skip, startWith, take, max } from './util/lilit.ts'
import { pad, mod } from './util/other.ts';

const env = Deno.env()

const input = (await read(Deno.stdin))
  .trim()
  .split(',')
  .map(Number);

const print = (mem) => pipe(
  mem, 
  map(pad(8, ' ')),
  grouped(4, 4, true), 
  forEach(x => console.log(x.join(','))),
);

const JUMP_IF_TRUE = 5;
const JUMP_IF_FALSE = 6;
const LESS_THAN = 7;
const EQUALS = 8;

export function* solve(input, ...inits) {
  const mem = [...input];

  let pc = 0;
  while (true) {
    if (env.DEBUG) print(mem);

    const inst = mem[pc++];
    const opcode = mod(inst, 100);

    if (opcode === 99) break;

    if (env.DEBUG) console.log('---');

    switch (opcode) {
      case 1: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        mem[mem[pc++]] = a + b;
        break;
      }
      case 2: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        mem[mem[pc++]] = a * b;
        break;
      }
      case 3: {
        mem[mem[pc++]] = inits.shift();
        break;
      }
      case 4: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const param1 = mem[pc++];
        inits.push(yield mode1 ? param1 : mem[param1]);
        break;
      }
      case JUMP_IF_TRUE: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        if (a !== 0) pc = b
        break;
      }
      case JUMP_IF_FALSE: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        if (a === 0) pc = b
        break;
      }
      case LESS_THAN: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        mem[mem[pc++]] = a < b ? 1 : 0;
        break;
      }
      case EQUALS: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const mode2 = Math.floor(mod(inst, 10000) / 1000);
        const param1 = mem[pc++];
        const param2 = mem[pc++];
        const a = mode1 ? param1 : mem[param1];
        const b = mode2 ? param2 : mem[param2];
        mem[mem[pc++]] = a === b ? 1 : 0;
        break;
      }
      default: throw Error(String(opcode));
    }
  }
  // return mem[0];
}

function dothething([pa, pb, pc, pd, pe]) {
  const r0 = 0;
  const [r1] = [...solve(input, pa, r0)];
  const [r2] = [...solve(input, pb, r1)];
  const [r3] = [...solve(input, pc, r2)];
  const [r4] = [...solve(input, pd, r3)];
  const [r5] = [...solve(input, pe, r4)];
  return r5;
}

pipe(
  permutations(range(0, 5), 5),
  map(dothething),
  max(),
  x => console.log(x),
);

// 2
// function dothething2([pa, pb, pc, pd, pe]) {
//   const pc1 = solve(input, pa);
//   const pc2 = solve(input, pb);
//   const pc3 = solve(input, pc);
//   const pc4 = solve(input, pd);
//   const pc5 = solve(input, pe);
//   let done, value
//   while (true) {
//     ({ done, value } = pc1.next(0));
//     ({ done, value } = pc2.next(value));
//     ({ done, value } = pc3.next(value));
//     ({ done, value } = pc4.next(value));
//     ({ done, value } = pc5.next(value));
//   }
// }
//
// pipe(
//   permutations(range(5, 10), 5),
//   map(dothething),
//   max(),
//   x => console.log(x),
// );