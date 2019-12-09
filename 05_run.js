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

    const getParam = (nr) => {
      const u = 100 * 10**nr;
      const l = 10 * 10**nr;
      const mode = Math.floor(mod(inst, u) / l);
      const param = mem[pc++];
      return mode ? param : mem[param];
    }

    switch (opcode) {
      case 1: {
        const a = getParam(1);
        const b = getParam(2);
        mem[mem[pc++]] = a + b;
        break;
      }
      case 2: {
        const a = getParam(1);
        const b = getParam(2);
        mem[mem[pc++]] = a * b;
        break;
      }
      case 3: {
        mem[mem[pc++]] = inits.shift();
        break;
      }
      case 4: {
        const a = getParam(1);
        inits.push(yield a);
        break;
      }
      case JUMP_IF_TRUE: {
        const a = getParam(1);
        const b = getParam(2);
        if (a !== 0) pc = b
        break;
      }
      case JUMP_IF_FALSE: {
        const a = getParam(1);
        const b = getParam(2);
        if (a === 0) pc = b
        break;
      }
      case LESS_THAN: {
        const a = getParam(1);
        const b = getParam(2);
        mem[mem[pc++]] = a < b ? 1 : 0;
        break;
      }
      case EQUALS: {
        const a = getParam(1);
        const b = getParam(2);
        mem[mem[pc++]] = a === b ? 1 : 0;
        break;
      }
      default: throw Error(String(opcode));
    }
  }
  return mem[0];
}