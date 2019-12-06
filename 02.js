#!/usr/bin/env -S deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, map, grouped, forEach, product2, range, find } from './util/lilit.ts'
import { pad } from './util/other.ts';

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

function solve(inp, noun, verb) {
  const mem = [...inp];
  mem[1] = noun;
  mem[2] = verb;

  let pc = 0;
  while (true) {
    if (env.DEBUG) print(mem);
    const opcode = mem[pc];
    if (opcode === 99) break;
    if (env.DEBUG) console.log('---');
    const a = mem[mem[pc + 1]];
    const b = mem[mem[pc + 2]];
    mem[mem[pc + 3]] = opcode === 1 
      ? a + b 
      : opcode === 2 
        ? a * b
        : (() => { throw Error() })();
    pc += 4;
  }
  return mem[0];
}

console.log(solve(input, 12, 2));

const [, noun, verb] = pipe(
  product2(range(0, 100), range(0, 100)),
  map(([n, v]) => [solve(input, n, v), n, v]),
  find(([r]) => r === 19690720),
);

console.log(100 * noun + verb);
