#!/usr/bin/env deno --allow-env --importmap=import_map.json

import { read } from './util/aoc.ts';
import { pipe, distinctUntilChanged, length, groupedUntilChanged, some } from './util/lilit.ts';

// const env = Deno.env();

const [, from, to] = (await read(Deno.stdin))
  .trim()
  .match(/(\d{6})-(\d{6})/)
  .map(Number);

function solve(predicate) {
  let count = 0;
  for (let d1 = 0; d1 <= 9; d1++) {
    for (let d2 = d1; d2 <= 9; d2++) {
      for (let d3 = d2; d3 <= 9; d3++) {
        for (let d4 = d3; d4 <= 9; d4++) {
          for (let d5 = d4; d5 <= 9; d5++) {
            for (let d6 = d5; d6 <= 9; d6++) {
              const digits = [d1, d2, d3, d4, d5, d6];
              const n = Number(digits.join(''));
              if (n >= from && n <= to && predicate(digits, n)) count++;
            }
          }
        }
      }
    }
  }
  return count;
}

// 1
console.log(solve((digits) => pipe(digits, distinctUntilChanged(), length()) <= 5));

// 2
console.log(solve((digits) => pipe(digits, groupedUntilChanged(), some((box) => box.length === 2))));