#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, grouped, forEach, product2, range, find } from './util/lilit.ts'
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

function solve(ip) {
  const mem = [...input];

  let register = ip

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
        mem[mem[pc++]] = register;
        break;
      }
      case 4: {
        const mode1 = Math.floor(mod(inst, 1000) / 100);
        const param1 = mem[pc++];
        console.log(mode1 ? param1 : mem[param1]);
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
      default: throw Error(opcode);
    }
  }
  return mem[0];
}

solve(1);
solve(5);
