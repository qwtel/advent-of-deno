// My little iterator library ("lilit")

import { tee, teeN, iterator, Constructor } from './iter-funcs.ts';



// OPERATORS

export function map<X, Y>(f: (x: X) => Y) {
  return function*(xs: Iterable<X>): IterableIterator<Y> {
    for (const x of xs) yield f(x);
  };
}

// Similar to map, but will yield both x and f(x) as a tuple.
// Same as `xs => zip2(xs, map(f)(xs))`.
export function zipMap<X, Y>(f: (x: X) => Y) {
  return function*(xs: Iterable<X>): IterableIterator<[X, Y]> {
    for (const x of xs) yield [x, f(x)];
  };
}

export function zipWith1<X, Y>(ys: Iterable<Y>) {
  return (xs: Iterable<X>) => zip2(xs, ys);
}

export function zipWith2<X, Y, Z>(ys: Iterable<Y>, zs: Iterable<Z>) {
  return (xs: Iterable<X>) => zip3(xs, ys, zs);
}

export function zipWith<X, Y>(ys: Iterable<Y>): (xs: Iterable<X>) => IterableIterator<[X, Y]>;
export function zipWith<X, Y, Z>(ys: Iterable<Y>, zs: Iterable<Z>): (xs: Iterable<X>) => IterableIterator<[X, Y, Z]>;
export function zipWith(...yss: Iterable<{}>[]) {
  return (xs: Iterable<{}>) => zip(xs, ...yss);
}

// Similar to `zipMap`, but expects 2-tuples as input.
export function expand2<X1, X2, Y>(f: (x: [X1, X2]) => Y) {
  return function*(xs: Iterable<[X1, X2]>): IterableIterator<[X1, X2, Y]> {
    for (const x of xs) yield [x[0], x[1], f(x)];
  };
}

// Similar to `zipMap`, but expects 3-tuples as input.
export function expand3<X1, X2, X3, Y>(f: (x: [X1, X2, X3]) => Y) {
  return function*(xs: Iterable<[X1, X2, X3]>): IterableIterator<[X1, X2, X3, Y]> {
    for (const x of xs) yield [x[0], x[1], x[2], f(x)];
  };
}

// Similar to `zipMap`, but expects n-tuples as input.
export function expand(f: (x: {}[]) => any) {
  return function*(xs: Iterable<{}[]>): IterableIterator<{}[]> {
    for (const x of xs) yield [...x, f(x)];
  };
}

export function tap<X>(f: (x: X) => any) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    for (const x of xs) {
      f(x);
      yield x;
    }
  };
}

export { tap as inspect }

export function forEach<X>(f: (x: X) => any = () => {}) {
  return function(xs: Iterable<X>): void {
    for (const x of xs) f(x);
  };
}

export { forEach as subscribe }

export function reduce<X, R>(f: (acc: R, x: X) => R, init: R) {
  return function(xs: Iterable<X>): R {
    let res = init;
    for (const x of xs) {
      res = f(res, x);
    }
    return res;
  };
}

export function scan<X, R>(f: (acc: R, x: X) => R, init: R) {
  return function*(xs: Iterable<X>): IterableIterator<R> {
    let res = init;
    for (const x of xs) {
      res = f(res, x);
      yield res;
    }
  };
}

export { scan as reducutions }

export function some<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): boolean {
    for (const x of xs) {
      if (p(x)) return true;
    }
    return false;
  };
}

export function every<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): boolean {
    for (const x of xs) {
      if (!p(x)) return false;
    }
    return true;
  };
}

export function filter<X>(p: (x: X) => boolean) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    for (const x of xs) {
      if (p(x)) yield x;
    }
  };
}

export function filterKeys<K, V>(p: (k: K) => boolean) {
  return function*(xs: Iterable<[K, V]>): IterableIterator<[K, V]> {
    for (const x of xs) {
      const [k] = x;
      if (p(k)) yield x;
    }
  };
}

export function filterValues<K, V>(p: (k: V) => boolean) {
  return function*(xs: Iterable<[K, V]>): IterableIterator<[K, V]> {
    for (const x of xs) {
      const [, v] = x;
      if (p(v)) yield x;
    }
  };
}

export { filterKeys as filterFirst, filterValues as filterSecond }

export function filterMap<X, Y>(f: (x: X) => Y) {
  return function*(xs: Iterable<X>): IterableIterator<Y> {
    for (const x of xs) {
      const y = f(x);
      if (y != null) yield y;
    }
  };
}

export function partition<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [filter(p)(xs1), filter((x: X) => !p(x))(xs2)];
  };
}

export function skip<X>(n: number) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    let i = 0;
    for (const x of xs) {
      if (++i <= n) continue;
      yield x;
    }
  };
}

export function take<X>(n: number) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    let i = 0;
    for (const x of xs) {
      if (++i > n) break;
      yield x;
    }
  };
}

export function takeLast<X>(n: number) {
  const UNDEF = Symbol('UNDEF');
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const ys = new Array(n).fill(UNDEF);
    for (const x of xs) {
      ys.shift();
      ys.push(x);
    }
    for (const y of ys) if (y !== UNDEF) yield y;
  };
}

export function first<X>(fallback?: X) {
  return function(xs: Iterable<X>): X {
    const it = iterator(xs);
    return it.next().value || fallback;
  }
}

export function second<X>(fallback?: X) {
  return function(xs: Iterable<X>): X {
    const it = iterator(xs);
    it.next();
    return it.next().value || fallback;
  }
}

export function nth<X>(n: number, fallback?: X) {
  return function(xs: Iterable<X>): X {
    const it = iterator(xs);
    for (let i = 0; i < n - 1; i++) it.next();
    return it.next().value || fallback;
  }
}

export function last<X>(fallback?: X) {
  return function(xs: Iterable<X>): X {
    let res: X;
    for (const x of xs) res = x;
    return res || fallback;
  }
}

// TODO: rename?
export function partitionAt<X>(n: number) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [take<X>(n)(xs1), skip<X>(n)(xs2)];
  };
}

export { partitionAt as splitAt }

export function skipWhile<X>(f: (x: X) => boolean) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const it = iterator(xs);
    let res: IteratorResult<X>;
    while ((res = it.next(), !res.done)) {
      if (f(res.value)) continue;
      else break;
    }
    yield res.value;
    for (const x of it) yield x;
  };
}

export function takeWhile<X>(f: (x: X) => boolean) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    for (const x of xs) {
      if (f(x)) yield x;
      else break;
    }
  };
}

export function partitionWhile<X>(f: (x: X) => boolean) {
  return function(xs: Iterable<X>): [IterableIterator<X>, IterableIterator<X>] {
    const [xs1, xs2] = tee(xs);
    return [takeWhile<X>(f)(xs1), skipWhile<X>(f)(xs2)];
  };
}

export function find<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): X | null {
    for (const x of xs) {
      if (p(x)) return x;
    }
    return null;
  };
}

export function findLast<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): X | null {
    let last = null;
    for (const x of xs) {
      if (p(x)) last = x;
    }
    return last;
  };
}

export function findIndex<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): number {
    let i = 0;
    for (const x of xs) {
      if (p(x)) return i;
      i++;
    }
    return -1;
  };
}

export function findLastIndex<X>(p: (x: X) => boolean) {
  return function(xs: Iterable<X>): number {
    let i = 0;
    let l = -1;
    for (const x of xs) {
      if (p(x)) l = i;
      i++;
    }
    return l;
  };
}

export function pluck<X>(key: string | number) {
  return function*(xs: Iterable<Object>): IterableIterator<X | null> {
    for (const x of xs) yield x[key];
  };
}

export function pluck0<X, Y>() {
  return function*(xs: Iterable<[X, Y]>): IterableIterator<X> {
    for (const [x] of xs) yield x;
  };
}

export { pluck0 as pluckKeys };

export function pluck1<X, Y>() {
  return function*(xs: Iterable<[X, Y]>): IterableIterator<Y> {
    for (const [, y] of xs) yield y;
  };
}

export { pluck1 as pluckValues };

export function unzip2<X, Y>() {
  return function(xs: Iterable<[X, Y]>): [IterableIterator<X>, IterableIterator<Y>] {
    const [xs1, xs2] = tee(xs);
    return [pluck0<X, Y>()(xs1), pluck1<X, Y>()(xs2)];
  };
}

export function unzip3<X, Y, Z>() {
  return function(xs: Iterable<[X, Y, Z]>): [IterableIterator<X>, IterableIterator<Y>, IterableIterator<Z>] {
    const [xs1, xs2, xs3] = teeN(xs, 3);
    return [pluck<X>(0)(xs1), pluck<Y>(1)(xs2), pluck<Z>(2)(xs3)];
  };
}

export function unzip(n: number = 2) {
  return function(xs: Iterable<{}[]>): IterableIterator<{}>[] {
    const xss = teeN(xs, n);
    return xss.map((xs, i) => pluck(i)(xs));
  };
}

export function groupBy<X, K>(f: (x: X) => K, mapImpl: Constructor<Map<K, X[]>> = Map) {
  return function(xs: Iterable<X>): Map<K, X[]> {
    const res = new mapImpl();
    for (const x of xs) {
      const key = f(x);
      res.set(key, [...(res.get(key) || []), x]);
    }
    return res;
  };
}

export function groupByKey<X>(key: string | number) {
  return groupBy<X, string | number>((x: X) => x[key]);
}

export function mapKeys<KA, KB, V>(f: (k: KA) => KB) {
  return function*(xs: Iterable<[KA, V]>): IterableIterator<[KB, V]> {
    for (const [k, v] of xs) yield [f(k), v];
  };
}

export { mapKeys as mapFirst }

export function mapValues<VA, VB, K>(f: (v: VA) => VB) {
  return function*(xs: Iterable<[K, VA]>): IterableIterator<[K, VB]> {
    for (const [k, v] of xs) yield [k, f(v)];
  };
}

export { mapKeys as mapSecond }

export function pairwise<X>() {
  return function*(xs: Iterable<X>): IterableIterator<[X, X]> {
    const it = iterator(xs);
    let prev = (it.next()).value;
    for (const x of it) {
      yield [prev, x];
      prev = x;
    }
  };
}

export function length() {
  return function(xs: Iterable<{}>): number {
    let c = 0;
    for (const _ of xs) c++;
    return c;
  };
}

export { length as count, length as size }

export function min() {
  return function(xs: Iterable<number>): number {
    let res = Number.POSITIVE_INFINITY;
    for (const x of xs) {
      if (x < res) res = x;
    }
    return res;
  };
}

export function max() {
  return function(xs: Iterable<number>): number {
    let res = Number.NEGATIVE_INFINITY;
    for (const x of xs) {
      if (x > res) res = x;
    }
    return res;
  };
}

export function minMax() {
  return function(xs: Iterable<number>): [number, number] {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const x of xs) {
      if (x < min) min = x;
      if (x > max) max = x;
    }
    return [min, max];
  };
}

export function minBy<X>(cf: (a: X, b: X) => number) {
  return function(xs: Iterable<X>): X | null {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) return null;
    let res = value;
    for (const x of it) if (cf(x, res) < 0) res = x;
    return res;
  };
}

export function maxBy<X>(cf: (a: X, b: X) => number) {
  return function(xs: Iterable<X>): X | null {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) return null;
    let res = value;
    for (const x of it) if (cf(x, res) > 0) res = x;
    return res;
  };
}

export function minByKey<X>(key: string | number | symbol) {
  return (xs: Iterable<X>): X | null => {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) return null;
    let best = value;
    for (const x of it) if (x[key] < best[key]) best = x;
    return best;
  };
}

export function maxByKey<X>(key: string | number | symbol) {
  return (xs: Iterable<X>): X | null => {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) return null;
    let best = value;
    for (const x of it) if (x[key] > best[key]) best = x;
    return best;
  };
}

export function minMaxBy<X>(cf: (a: X, b: X) => number) {
  return function(xs: Iterable<X>): [X | null, X | null] {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) return [null, null];
    let min = value;
    let max = value;
    for (const x of it) {
      if (cf(x, min) < 0) min = x;
      if (cf(x, max) > 0) max = x;
    }
    return [min, max];
  };
}

export function minByScan<X>(cf: (a: X, b: X) => number) {
  return function*(xs: Iterable<X>): IterableIterator<X | null> {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) yield null;
    let res = value;
    for (const x of it) {
      if (cf(x, res) < 0) res = x;
      yield res;
    }
  };
}

export function maxByScan<X>(cf: (a: X, b: X) => number) {
  return function*(xs: Iterable<X>): IterableIterator<X | null> {
    const it = iterator(xs);
    const { done, value } = it.next();
    if (done) yield null;
    let res = value;
    for (const x of it) {
      if (cf(x, res) > 0) res = x;
      yield res;
    }
  };
}

export function sum(zero: number = 0) {
  return function(xs: Iterable<number>): number {
    let res = zero;
    for (const x of xs) res += x;
    return res;
  };
}

export function replaceWhen<X, Y>(pf: (x: X) => boolean, ys: Iterable<Y>) {
  return function*(xs: Iterable<X>): IterableIterator<X | Y> {
    for (const [x, y] of zip2(xs, ys)) {
      if (!pf(x)) yield x;
      else yield y;
    }
  };
}

export function grouped<X>(n: number, step: number = n, incomplete: boolean = false) {
  return function*(xs: Iterable<X>): IterableIterator<X[]> {
    let group = [];
    for (const x of xs) {
      group.push(x);
      if (group.length === n) {
        yield [...group];
        for (let i = 0; i < step; i++) group.shift();
      }
    }
    if (incomplete && group.length) yield group;
  };
}

export function startWith<X>(...as: X[]) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    for (const a of as) yield a;
    for (const x of xs) yield x;
  };
}

export function endWith<X>(...zs: X[]) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    for (const x of xs) yield x;
    for (const z of zs) yield z;
  };
}

export function sort<X>(cf: (a: X, b: X) => number) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const arr = [...xs].sort(cf);
    for (const x of arr) yield x;
  };
}

export function reverse<X>() {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const xs2 = [...xs];
    for (let i = xs2.length - 1; i >= 0; i--) yield xs2[i];
  }
}

export function sortScan<X>(cf: (a: X, b: X) => number) {
  return function*(xs: Iterable<X>): IterableIterator<X[]> {
    let arr = [];
    for (const x of xs) {
      arr.push(x);
      yield [...arr.sort(cf)];
    }
  };
}

export function flatten<X>() {
  return function*(xss: Iterable<Iterable<X>>): IterableIterator<X> {
    for (const xs of xss) for (const x of xs) yield x;
  };
}

export { flatten as flat }

export function flatMap<A, B>(f: (x: A) => Iterable<B>) {
  return function*(xs: Iterable<A>): IterableIterator<B> {
    for (const x of xs) for (const y of f(x)) yield y;
  };
}

export function distinctUntilChanged<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const it = iterator(xs);
    let { done, value: initial } = it.next();
    if (done) return;
    yield initial;
    for (const x of it) if (!comp(x, initial)) yield (initial = x);
  };
}

export function groupedUntilChanged<X>(equals: (a: X, b: X) => boolean = (a, b) => a === b) {
  return function*(xs: Iterable<X>): IterableIterator<X[]> {
    const it = iterator(xs);
    const { done, value: initial } = it.next();
    if (done) return;

    let group: X[] = [];

    group.push(initial);
    let prev = initial;

    for (const x of it) {
      if (equals(x, prev)) {
        group.push(x);
        prev = x;
      } else {
        yield [...group];
        group = [x];
        prev = x;
      }
    }

    if (group.length) yield group
  };
}

export function unique<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const arr = [...xs];
    const unq = arr.filter((x, i, self) => self.findIndex(y => comp(x, y)) === i);
    for (const u of unq) yield u;
  };
}

export { unique as distinct }

export function uniqueSorted<X>(comp: (a: X, b: X) => boolean = (a, b) => a === b) {
  return function*(xs: Iterable<X>): IterableIterator<X> {
    const arr = [...xs].sort(); // FIXME
    for (const x of distinctUntilChanged(comp)(arr)) yield x;
  };
}

export function toArray<X>() {
  return (xs: Iterable<X>) => [...xs];
}

export { toArray as share }

export function toSet<X>(SetLike: typeof Set = Set) {
  return (xs: Iterable<X>) => new SetLike(xs);
}

export function toMap<K, V>(MapLike: typeof Map = Map) {
  return (xs: Iterable<[K, V]>) => new MapLike(xs);
}

export function toString() {
  return (xs: Iterable<String>) => [...xs].join('');
}

// CONSTRUCTORS

export function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): IterableIterator<number> {
  for (let i = start; end > start ? i < end : i > end; i += step) yield i;
}
export function* rangeX(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1): IterableIterator<number> {
  for (let i = start; end > start ? i <= end : i >= end; i += step) yield i;
}

// TODO: rename to `entries`?
export function* enumerate<X>(xs: Iterable<X>): IterableIterator<[number, X]> {
  let i = 0;
  for (const x of xs) yield [i++, x];
}

export function* concat<X>(...xss: Iterable<X>[]): IterableIterator<X> {
  for (const xs of xss) for (const x of xs) yield x;
}

export function* concat2<X, Y>(xs: Iterable<X>, ys: Iterable<Y>): IterableIterator<X | Y> {
  for (const x of xs) yield x;
  for (const y of ys) yield y;
}

export { concat as chain }

export function* zip2<X, Y>(xs: Iterable<X>, ys: Iterable<Y>): IterableIterator<[X, Y]> {
  const xit = iterator(xs);
  const yit = iterator(ys);
  while (true) {
    const [xr, yr] = [xit.next(), yit.next()];
    if (xr.done || yr.done) break;
    yield [xr.value, yr.value];
  }
}

export function* zip3<X, Y, Z>(
  xs: Iterable<X>,
  ys: Iterable<Y>,
  zs: Iterable<Z>,
): IterableIterator<[X, Y, Z]> {
  const xit = iterator(xs);
  const yit = iterator(ys);
  const zit = iterator(zs);
  while (true) {
    const [xr, yr, zr] = [xit.next(), yit.next(), zit.next()];
    if (xr.done || yr.done || zr.done) break;
    yield [xr.value, yr.value, zr.value];
  }
}

export function* zip(...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  const its = xss.map(iterator);
  while (true) {
    const rs = its.map(it => it.next());
    if (rs.some(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

// TODO: rename? Is this how regular zip commonly works?
export function* zipOuter(...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  const its = xss.map(iterator);
  while (true) {
    const rs = its.map(it => it.next());
    if (rs.every(r => r.done)) break;
    yield rs.map(r => r.value);
  }
}

export function* product2<A, B>(as: Iterable<A>, bs: Iterable<B>): IterableIterator<[A, B]> {
  // if (as === bs) [as, bs] = tee(as);
  let bs2: Iterable<B>;
  for (const a of as) {
    [bs, bs2] = tee(bs);
    for (const b of bs2) {
      yield [a, b];
    }
  }
}

export function* product3<A, B, C>(
  as: Iterable<A>,
  bs: Iterable<B>,
  cs: Iterable<C>,
): IterableIterator<[A, B, C]> {
  // if (as === bs) [as, bs] = tee(as);
  // if (as === cs) [as, cs] = tee(as);
  // if (bs === cs) [bs, cs] = tee(bs);
  let bs2: Iterable<B>;
  let cs2: Iterable<C>;
  for (const a of as) {
    [bs, bs2] = tee(bs);
    for (const b of bs2) {
      [cs, cs2] = tee(cs);
      for (const c of cs2) {
        yield [a, b, c];
      }
    }
  }
}

export function* product(...xss: Iterable<{}>[]): IterableIterator<{}[]> {
  const pools = xss.map(xs => [...xs]);
  let result = [[]];
  for (const pool of pools) {
      const presult = result;
      result = [];
      for (const x of presult) for (const y of pool) result.push(x.concat(y));
  }
  for (const prod of result) yield prod;
}

export function* productN<X>(xs: Iterable<X>, r: number = 1): IterableIterator<X[]> {
  const pools = repeat([...xs], r);
  let result = [[]];
  for (const pool of pools) {
      const presult = result;
      result = [];
      for (const x of presult) for (const y of pool) result.push(x.concat(y));
  }
  for (const prod of result) yield prod;
}

export function* combinations2<X>(xs: Iterable<X>): IterableIterator<[X, X]> {
  let [as, bs] = tee(xs);

  let bs2: Iterable<X>;
  let i = 1;
  for (const a of as) {
    [bs, bs2] = tee(bs);
    for (const b of skip<X>(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export function combinations3<X>(xs: Iterable<X>): IterableIterator<[X, X, X]> {
  return combinations(xs, 3) as IterableIterator<[X, X, X]>;
}

export function* combinations<X>(xs: Iterable<X>, r: number = null): IterableIterator<X[]> {
  const pool = [...xs];
  const n = pool.length;
  const rv = [...range(0, n)];
  for (const indices of permutations(rv, r)) {
    if (pipe(indices, sort((a, b) => a - b), _ => zip2(_, indices), every(([a, b]) => a === b))) {
      const tuple = [];
      for (let i of indices) tuple.push(pool[i]);
      yield tuple;
    }
  }
}


export function* combinationsWithReplacement2<X>(xs: Iterable<X>): IterableIterator<[X, X]> {
  let [as, bs] = tee(xs);

  let bs2: Iterable<X>;
  let i = 0;
  for (const a of as) {
    [bs, bs2] = tee(bs);
    for (const b of skip<X>(i++)(bs2)) {
      yield [a, b];
    }
  }
}

export function* combinationsWithReplacement3<X>(xs: Iterable<X>): IterableIterator<[X, X, X]> {
  throw Error('Not implemented');
}

export function* combinationsWithReplacement(xs: Iterable<{}>, r: number = 2): IterableIterator<{}[]> {
  throw Error('Not implemented');
}

export function* permutations2<X>(xs: Iterable<X>): IterableIterator<[X, X]> {
  return permutations(xs, 2) as IterableIterator<[X, X]>;
}

export function* permutations3<X>(xs: Iterable<X>): IterableIterator<[X, X, X]> {
  return permutations(xs, 3) as IterableIterator<[X, X, X]>;
}

export function* permutations<X>(xs: Iterable<X>, r: number = 2): IterableIterator<X[]> {
  const pool = [...xs];
  const n = pool.length;
  r = r == null ? n : r;
  for (const indices of productN(range(0, n), r)) {
    if (pipe(indices, unique(), length()) === r) {
      const tuple = [];
      for (let i of indices) tuple.push(pool[i]);
      yield tuple;
    }
  }
}

export function* repeat<X>(value?: X, r: number = Number.POSITIVE_INFINITY): IterableIterator<X> {
  for (let i = 0; i < r; i++) yield value;
}

export { repeat as constantly }

export function* cycle<X>(xs: Iterable<X>, n: number = Number.POSITIVE_INFINITY): IterableIterator<X> {
  let xs2: Iterable<X>;
  for (let i = 0; i < n; i++) {
    [xs, xs2] = tee(xs);
    for (const x of xs2) yield x;
  }
}

export function* interleave2<X, Y>(xs: Iterable<X>, ys: Iterable<Y>): IterableIterator<X | Y> {
  const itx = iterator(xs);
  const ity = iterator(ys);
  while (true) {
    const rx = itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = ity.next();
    if (ry.done) break;
    else yield ry.value;
  }
}

export function* interleave3<X, Y, Z>(
  xs: Iterable<X>,
  ys: Iterable<Y>,
  zs: Iterable<Z>,
): IterableIterator<X | Y | Z> {
  const itx = iterator(xs);
  const ity = iterator(ys);
  const itz = iterator(zs);
  while (true) {
    const rx = itx.next();
    if (rx.done) break;
    else yield rx.value;
    const ry = ity.next();
    if (ry.done) break;
    else yield ry.value;
    const rz = itz.next();
    if (rz.done) break;
    else yield rz.value;
  }
}

export function* interleave(...xss: Iterable<{}>[]): IterableIterator<{}> {
  const its = xss.map(iterator);
  // Throwback to the 90s
  outer: while (true) {
    for (const it of its) {
      const { done, value } = it.next();
      if (done) break outer;
      else yield value;
    }
  }
}

export function frequencies<X>(iterable: Iterable<X>, mapImpl: Constructor<Map<X, number>> = Map) {
    const fs = new mapImpl();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}

// https://github.com/Microsoft/TypeScript/issues/17718#issuecomment-402931751
export function pipe<T1>(x: T1): T1;
export function pipe<T1, T2>(x: T1, f1: (x: T1) => T2): T2;
export function pipe<T1, T2, T3>(x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3): T3;
export function pipe<T1, T2, T3, T4>(x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4): T4;
export function pipe<T1, T2, T3, T4, T5>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5,): T5;
export function pipe<T1, T2, T3, T4, T5, T6>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6,): T6;
export function pipe<T1, T2, T3, T4, T5, T6, T7>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7,): T7;
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7, f7: (x: T7) => T8,): T8;
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7, f7: (x: T7) => T8, f8: (x: T8) => T9,): T9;
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7, f7: (x: T7) => T8, f8: (x: T8) => T9, f9: (x: T9) => T10,): T10;
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7, f7: (x: T7) => T8, f8: (x: T8) => T9, f9: (x: T9) => T10, f10: (x: T10) => T11,): T11;
export function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>( x: T1, f1: (x: T1) => T2, f2: (x: T2) => T3, f3: (x: T3) => T4, f4: (x: T4) => T5, f5: (x: T5) => T6, f6: (x: T6) => T7, f7: (x: T7) => T8, f8: (x: T8) => T9, f9: (x: T9) => T10, f10: (x: T10) => T11, f11: (x: T11) => T12,): T12;
export function pipe(x: any, ...fs: any[]): any {
  let res = x;
  for (const f of fs) if (f) res = f(res);
  return res;
}
