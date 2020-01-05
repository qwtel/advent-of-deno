#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts';
import { pipe, cycle,  skip, flatMap, constantly, toArray, take, findIndex, range, reducutions, scan } from '../util/iter.ts';
(async () => {

const joinStr = s => xs => [...xs].join(s);

const env = Deno.env();

const input = (await read())
  .trim()
  .split('')
  .map(Number);

if (env.DEBUG) console.log(input.join(''));

const basePattern = [0, 1, 0, -1];
const patternCache = new Map();
for (let i = 0; i < input.length; i++) {
  patternCache.set(i, pipe(cycle(basePattern), flatMap(p => constantly(p, i + 1)), skip(1), take(input.length), toArray()));
}

function fft(input, i) {
  const pattern = patternCache.get(i);
  let sum = 0;
  for (let j = 0; j < input.length; j++) {
    sum += input[j] * pattern[j];
  }
  return Math.abs(sum) % 10;
}

function solve1(input) {
  const inputs = [[...input], [...input]];
  let phase;
  for (phase = 0; phase < 100; phase++) {
    if (env.DEBUG && phase % 10 === 0) console.log(phase);
    const inputCurr = inputs[phase % 2];
    const inputNext = inputs[(phase + 1) % 2];
    for (let i = 0; i < input.length; i++) {
      inputNext[i] = fft(inputCurr, i);
    }
    if (env.DEBUG && phase % 10 === 0) console.log(inputNext.join(''));
  }
  return inputs[phase % 2];
}

pipe(solve1(input), take(8), joinStr(''), console.log);

// 2
const messageOffset = pipe(input, take(7), joinStr(''), Number, Math.floor);

if (env.DEBUG) {
  const m = 10000;
  console.log('Message offset :', messageOffset);
  console.log('Offset quantile:', messageOffset / (input.length * m));
  console.log("First '1'      :", pipe(cycle(basePattern), flatMap(n => constantly(n, messageOffset)), skip(1), findIndex(x => x === 1)));
  console.log('Input length   :', input.length * m);
  console.log('Slice length   :', input.length * m - messageOffset);
}

// Exploiting the fact that at high indices, the pattern essentially becomes `00...0011...11`,
// i.e. summation of the last n digits.
function solve2(slice) {
  const slices = [[...slice], [...slice]];
  let phase;
  for (phase = 0; phase < 100; phase++) {
    const sliceCurr = slices[phase % 2];
    const sliceNext = slices[(phase + 1) % 2];
    let sum = 0;
    for (let i = slice.length - 1; i >= 0; i--) {
      sum += sliceCurr[i];
      sliceNext[i] = Math.abs(sum) % 10;
    }
  }
  return slices[phase % 2];
}

const slice = pipe(cycle(input, 10000), skip(messageOffset), toArray());
pipe(solve2(slice), take(8), joinStr(''), console.log);

// function solve1_2(input) {
//   return pipe(
//     range(0, 100),
//     reduce((input, phase) => {
//       if (env.DEBUG && phase % 10 === 0) console.log(phase)
//       const inputNext = pipe(
//         range(0, input.length),
//         map(i => fft(input, i)),
//         toArray(),
//       );
//       if (env.DEBUG && phase % 10 === 0) console.log([...inputNext].join(''))
//       return inputNext;
//     }, input),
//   );
// }

})();
