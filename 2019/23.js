#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { pipe,  map, grouped, find, range, pairwise, skip, cycle, first } from '../util/lilit.ts'
import { run } from './intcode2.js'
(async () => {

const env = Deno.env()

const input = (await read())
  .trim()
  .split(',')
  .map(Number)

const NAT = 50;

class IdleQueue {
  constructor(iter) {
    this.q = [...iter];
    this.idle = this.q.length === 0;
  }
  push(...args) {
    this.q.push(...args);
    this.idle = false;
  }
  *[Symbol.iterator]() {
    for (;;) {
      const x = this.q.shift();
      if (x != null) yield x;
      else {
        this.idle = true;
        yield -1;
      }
    }
  }
}

class NATQueue {
  push(x, y) {
    this.x = x;
    this.y = y;
  }
  get idle() { return true; }
}

class SendBuffer {
  constructor(qs) {
    this.qs = qs;
    this.buffer = [];
  }
  push(v) {
    this.buffer.push(v);
    if (this.buffer.length === 3) {
      const [ip, x, y] = this.buffer;
      this.qs[Math.min(ip, NAT)].push(x, y);
      this.buffer = [];
    }
  }
}

function* solve() {
  const queues = new Array(50).fill(null).map((_, i) => new IdleQueue([i]));
  const buffers = new Array(50).fill(null).map(() => new SendBuffer(queues));
  const computers = [...pipe(queues, map(q => run(input, q)))];

  queues[NAT] = new NATQueue();
  buffers[NAT] = new SendBuffer(queues);
  computers[NAT] = (function* () {
    for(;;) {
      if (queues.every(q => q.idle)) {
        yield 0;
        yield queues[NAT].x;
        yield queues[NAT].y;
      } else yield;
    }
  })();

  for(const i of cycle(range(0, 51))) {
    const { value } = computers[i].next();
    if (value != null) {
      if (i === NAT) yield value;
      buffers[i].push(value);
    }
  }
}

// 1
pipe(
  solve(),
  grouped(3),
  map(([,, y]) => y),
  skip(1),
  first(),
  console.log,
);

// 2
pipe(
  solve(),
  grouped(3),
  map(([,, y]) => y),
  skip(1),
  pairwise(),
  find(([a, b]) => a === b),
  ([a]) => a,
  console.log,
);

})();
