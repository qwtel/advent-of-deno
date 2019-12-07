import { pad, mod } from './util/other.ts';
import { pipe, map, grouped, forEach } from './util/lilit.ts'

const env = Deno.env()

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

export function* run(input, ...inits) {
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
  return mem[0];
}