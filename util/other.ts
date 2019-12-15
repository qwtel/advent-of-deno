export function frequencies<X>(iterable: Iterable<X>) {
    const fs = new Map<X, number>();
    for (const item of iterable) {
        fs.set(item, 1 + (fs.get(item) || 0));
    }
    return fs;
}

export function findAndRemove<X>(arr: X[], f: (x: X) => boolean) {
    const i = arr.findIndex(f);
    return i === -1
        ? null
        : arr.splice(i, 1)[0];
}

// Fix for JS' modulo operator to support negative numbers.
export function mod(a: number, n: number) {
    return ((a % n) + n) % n
}

export function pad(n, char = ' ') {
    return s => (new Array(n).fill(char).join('') + s).slice(-n);
}

// Old 2d array helper function, surpassed by Array2D class
export function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
}

export function flatten<X>(as: X[][]): X[] {
    return as.reduce((res, a) => (res.push(...a), res), [])
}

// Old 2d array helper function, surpassed by Array2D class
export function* walk2D(arr2D) {
    for (const row of arr2D)
        for (const cell of row)
            yield cell;
}

// Old 2d array helper function, surpassed by Array2D class
export function map2D(arr2D, f) {
    return arr2D.map(row => row.map(f));
}

// Alternative title: Tuple-compare
export function arrayCompare(as, bs): number {
    const res = as[0] - bs[0];
    if (res === 0 && as.length > 1) {
        return arrayCompare(as.slice(1), bs.slice(1));
    } else {
        return res;
    }
}

export function getIn(keys) {
    return (x) => {
        let r = x;
        for (const k of keys) {
            r = r != null ? r[k] : undefined;
        }
        return r;
    }
}

// Allows getting (and only getting!) out of bounds indices on an array, including negative indices.
// E.g. `wrapped[-1]` will return the last element.
// Usage: `const wrapped = wrap([1,2,3])`
export const wrap = (arr = []) => new Proxy(arr, {
    get: (arr, prop) => {
        if (typeof prop === 'symbol') return arr[prop];
        const index = Number(prop);
        if (Number.isNaN(index)) return arr[prop];
        return arr[mod(index, arr.length)];
    },
});

function _lcm(a: number, b: number): number {
  if (a == 0 || b == 0) {
      return 0;
  }
  return (a * b) / _gcd(a, b);
}


function _gcd(a: number, b: number): number {
  if (a < 1 || b < 1) {
    throw Error("a or b is less than 1");
  }
  let remainder = 0;
  do {
    remainder = a % b;
    a = b; 
    b = remainder;
  } while (b !== 0);
  return a;
}

export function lcm(a: number, ...bs: number[]) {
    return bs.reduce(_lcm, a);
}

export function gcd(a: number, ...bs: number[]) {
    return bs.reduce(_gcd, a);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 * @see https://stackoverflow.com/a/1527820/870615
 */
export function getRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const add = (a: number, b: number): number => a + b;
export const sub = (a: number, b: number): number => a - b;
export const mul = (a: number, b: number): number => a * b;
export const div = (a: number, b: number): number => a / b;

export const addN = (a?: number, ...bs: number[]) => bs.reduce(add, a);
export const subN = (a?: number, ...bs: number[]) => a - addN(...bs);
export const mulN = (a?: number, ...bs: number[]) => bs.reduce(mul, a);
export const divN = (a?: number, ...bs: number[]) => a / mulN(...bs);