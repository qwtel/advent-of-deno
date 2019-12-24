export type ForOfAwaitable<T> = AsyncIterable<T> | Iterable<T>;
export type ForOfAwaitableIterator<T> = AsyncIterableIterator<T> | IterableIterator<T>;

export function iterator<T>(xs: Iterable<T>): IterableIterator<T> {
  const it = xs[Symbol.iterator]();
  if (!it[Symbol.iterator]) it[Symbol.iterator] = () => it;
  return it as IterableIterator<T>;
}

export function asyncIterator<T>(xs: AsyncIterable<T>): AsyncIterableIterator<T> {
  const it = xs[Symbol.asyncIterator]();
  if (!it[Symbol.asyncIterator]) it[Symbol.asyncIterator] = () => it;
  return it as AsyncIterableIterator<T>;
}

export function forAwaitableIterator<T>(xs: ForOfAwaitable<T>): ForOfAwaitableIterator<T> {
  return xs[Symbol.asyncIterator] ? asyncIterator(xs as AsyncIterable<T>) : iterator(xs as Iterable<T>);
}

export function isIterator(xs: any): boolean {
  return xs && xs[Symbol.iterator] && xs[Symbol.iterator]() === xs;
}

export function isAsyncIterator(xs: any) {
  return xs && xs[Symbol.asyncIterator] && xs[Symbol.asyncIterator]() === xs;
}

export function isForOfAwaitableIterator(xs: any): boolean {
  return isAsyncIterator(xs) || isIterator(xs);
}

// https://stackoverflow.com/a/46416353/870615
export function tee<T>(it: Iterable<T> | Iterator<T>): [Iterable<T>, Iterable<T>] {
  // If `it` is not an iterator, i.e. can be traversed more than once,
  // we just return it unmodified.
  if (!isIterator(it)) return [it, it] as [Iterable<T>, Iterable<T>];

  const source = it as Iterator<T>;
  const buffers: [T[], T[]] = [[], []];
  const DONE = Symbol('done');

  const next = (i: number): T | symbol => {
    if (buffers[i].length) return buffers[i].shift();
    const x = source.next();
    if (x.done) return DONE;
    buffers[1 - i].push(x.value);
    return x.value;
  };

  function* buffer2Iterable(i: number): Iterable<T> {
    while (true) {
      const x = next(i);
      if (x === DONE) break;
      yield x as T;
    }
  }

  return [buffer2Iterable(0), buffer2Iterable(1)];
}

export function asyncTee<T>(it: ForOfAwaitable<T> | ForOfAwaitableIterator<T>): [ForOfAwaitable<T>, ForOfAwaitable<T>] {
  if (!isForOfAwaitableIterator(it)) return [it, it] as [ForOfAwaitable<T>, ForOfAwaitable<T>];

  const source = it as ForOfAwaitableIterator<T>;
  const buffers = [[], []];
  const DONE = Symbol('done');

  const next = async (i: number): Promise<T | symbol> => {
    if (buffers[i].length) return buffers[i].shift();
    const x = await source.next();
    if (x.done) return DONE;
    buffers[1 - i].push(x.value);
    return x.value;
  };

  async function* buffer2AsyncIterable(i: number): AsyncIterable<T> {
    while (true) {
      const x = await next(i);
      if (x === DONE) break;
      yield x as T;
    }
  }

  return [buffer2AsyncIterable(0), buffer2AsyncIterable(1)];
}

// TODO: more performant impl?
export function teeN<T>(it: Iterable<T> | Iterator<T>, n: number = 2): Iterable<T>[] {
  const res = [];
  let orig = it;
  let copy: Iterable<T>;
  for (let i = 0; i < n - 1; i++) {
    [orig, copy] = tee(orig);
    res.push(copy);
  }
  res.push(orig);
  return res;
}

export function asyncTeeN<T>(it: ForOfAwaitable<T> | ForOfAwaitableIterator<T>, n: number = 2): ForOfAwaitable<T>[] {
  const res = [];
  let orig = it;
  let copy: ForOfAwaitable<T>;
  for (let i = 0; i < n - 1; i++) {
    [orig, copy] = asyncTee(orig);
    res.push(copy);
  }
  res.push(orig);
  return res;
}
