import { pad, mod } from '../util/other.ts';
import { pipe, map, grouped, forEach } from '../util/iter.ts'

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

export function* run(initialMemory, initialInputs = []) {
  const mem = [...initialMemory].map(BigInt);
  let inputs = initialInputs[Symbol.iterator]();

  let pc = 0n;
  let rb = 0n;

  computer: while (true) {
    if (env.DEBUG_INT) print(mem);

    const inst = Number(mem[pc++]);
    const opcode = mod(inst, 100);

    if (opcode === 99) break;

    if (env.DEBUG_INT) console.log('---');

    const getParam = (nr) => {
      const u = 100 * 10 ** nr;
      const l = 10 * 10 ** nr;
      const mode = Math.floor(mod(inst, u) / l);
      const param = mem[pc++];
      switch (mode) {
        case 0: return mem[param] || 0n;
        case 1: return param;
        case 2: return mem[rb + param] || 0n;
        default: throw Error(String(mode));
      }
    }

    const setParam = (nr, value) => {
      const u = 100 * 10 ** nr;
      const l = 10 * 10 ** nr;
      const mode = Math.floor(mod(inst, u) / l);
      const param = mem[pc++];
      switch (mode) {
        case 0: mem[param] = value; break;
        case 2: mem[rb + param] = value; break;
        case 1: throw Error('Immediate mode not allowed here');
        default: throw Error(String(mode));
      }
    }

    switch (opcode) {
      case 1: {
        const a = getParam(1);
        const b = getParam(2);
        setParam(3, a + b);
        break;
      }
      case 2: {
        const a = getParam(1);
        const b = getParam(2);
        setParam(3, a * b);
        break;
      }
      case 3: {
        const next = inputs.next().value;
        if (next == null) break computer; 
        setParam(1, BigInt(next));
        break;
      }
      case 4: {
        const a = getParam(1);
        const x = yield Number(a);
        if (x) inputs = x[Symbol.iterator]();
        break;
      }
      case JUMP_IF_TRUE: {
        const a = getParam(1);
        const b = getParam(2);
        if (a !== 0n) pc = b
        break;
      }
      case JUMP_IF_FALSE: {
        const a = getParam(1);
        const b = getParam(2);
        if (a === 0n) pc = b
        break;
      }
      case LESS_THAN: {
        const a = getParam(1);
        const b = getParam(2);
        setParam(3, a < b ? 1n : 0n);
        break;
      }
      case EQUALS: {
        const a = getParam(1);
        const b = getParam(2);
        setParam(3, a === b ? 1n : 0n);
        break;
      }
      case 9: {
        const a = getParam(1);
        rb += a;
        break;
      }
      default: throw Error(String(opcode));
    }
  }
  return Number(mem[0]);
}
