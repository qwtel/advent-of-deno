#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { Array2D } from '../util/array2d.ts';
import { ValMap } from '../util/values.ts';
import { pipe, filter, map, constantly, grouped, count } from '../util/iter.ts';
import { run } from './intcode.js';
(async () => {

const env = Deno.env();

const input = (await read())
  .trim()
  .split(',')
  .map(Number);

// 1
const screen = new ValMap(pipe(
  run(input),
  grouped(3),
  map(([x, y, c]) => [[x, y], c]),
));
pipe(screen.values(), filter(c => c === 2), count(), console.log);

// 2
const frameBuffer = Array2D.fromPointMap(screen);
let joystick = constantly(0);
let playerX = 0;
let ballX = 0;
let score = 0;

function* play() {
  input[0] = 2;
  const game = run(input);
  while (true) {
    const { value, done } = game.next(joystick);
    if (done) break;
    yield value;
  }
}

for (const [x, y, c] of pipe(play(), grouped(3))) {
  if (x === -1 && y === 0) {
    score = c;
  } else {
    frameBuffer.set([x, y], c);
    if (c === 3) {
      playerX = x;
      joystick = constantly(Math.sign(ballX - playerX));
    } else if (c === 4) {
      ballX = x;
      joystick = constantly(Math.sign(ballX - playerX));
    }
  }

  if (env.DEBUG) {
    console.log(score);
    console.log(frameBuffer.map(c => { switch(c) {
      case 0: return ' ';
      case 1: return '#';
      case 2: return 'x';
      case 3: return '-';
      case 4: return 'o';
    }}).toString());
  }
}

console.log(score);

})();
