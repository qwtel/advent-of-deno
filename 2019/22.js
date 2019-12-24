#!/usr/bin/env -S deno --allow-env --importmap=../import_map.json

import { read } from '../util/aoc.ts'
import { pipe, range, findIndex } from '../util/iter.ts'
(async () => {

const RE_1 = /deal into new stack/
const RE_2 = /cut (-?\d+)/
const RE_3 = /deal with increment (\d+)/

const env = Deno.env()

const sdeck = [...range(0, 10)];
const deck = [...range(0, 10007)];

const dealIntoStack = x => x.reverse();

// 0 1 2 3[4]5 6 7 8 9 stack
// 9 8 7 6[5]4 3 2 1 0

// deck[2020] = 9 - deck[2020]

const cutN = n => x => { 
  if (n > 0) for (let _ of range(0, n)) x.push(x.shift()); 
  if (n < 0) for (let _ of range(0, n, -1)) x.unshift(x.pop());
  return x;
}

// 0 1 2 3[4]5 6 7 8 9 cutN=3
// 3 4 5 6[7]8 9 0 1 2

// 0 1 2 3[4]5 6 7 8 9 cutN=-4
// 6 7 8 9[0]1 2 3 4 5 cutN=-4

// deck[2020] = deck[2020] + 3 % 10
// deck[2020] = deck[2020] - 4 % 10

const dealWithN = n => x => {
  const table = [];
  const len = x.length;
  for (let i=0; i<len*n; i+=n) table[i % len] = x.shift();
  return table;
}


// 0 1 2 3[4]5 6 7 8 9101112131415161718192021222324252627 dealN = 3
// 0 7 4 1[8]5 2 9 6 3 
// 0     1     2     3     4     5     6     7     8     9
// 0     1     2     3  (0)
//     4     5     6    (2)
//   7     8     9      (1)

// i_next = (deck[i] * 3) % 10

// 0 1 2 3[4]5 6 7 8 9 dealN = 7
// 0 3 6 9[2]5 8 1 4 7
// 0             1      (0) 0
//         2            (4) 1
//   3             4    (1) 2
//           5          (5) 3
//     6             7  (2) 4
//             8        (6) 5
//       9              (3) 6

// 0123456789
// 0741852963 
//    1  2  3  (0)
//   4  5  6   (1)
//  7  8  9    (2)
// 0123456789
// 0369258147
// 0      1    (1)
//     2       (2)
//  7      4   (3)
//      5      (4)
//   6      7  (5)
//       8     (6)
//    9        (7)

const input = (await read())
  .trim()
  .split('\n')
  .map(x => {
    let match;
    if (match = x.match(RE_1)) {
      return dealIntoStack;
    } else if (match = x.match(RE_2)) {
      return cutN(Number(match[1]));
    } else if (match = x.match(RE_3)) {
      return dealWithN(Number(match[1]));
    }
  });

pipe(deck, ...input, findIndex(x => x === 2019), console.log)

// 2
// const deckSize = 119_315_717_514_047;
// const iteratio = 101_741_582_076_661;
// for (let i=0; i<iteratio; i++) if (i % 1_000_000_000 === 0) console.log(i)

})();
