// @ts-ignore
import { Set as ISet } from 'immutable';

import { map } from './iter.ts';

import { IV, SET_TYPE, fromImmutableKey, toImmutableKey, is } from './val-funcs.ts';

export class ValSet<K> extends Set<K> {
  private _set: any;

  constructor(init?: Iterable<K> | ValSet<K>) {
    super();
    this._set = init instanceof ValSet
      ? init.data.asMutable().delete(SET_TYPE)
      : ISet(map(toImmutableKey)(init || [])).asMutable();
  }

  add(v: K) {
    this._set.add(toImmutableKey(v));
    return this;
  }

  has(v: K): boolean {
    return this._set.has(toImmutableKey(v));
  }

  delete(v: K): boolean {
    const val = toImmutableKey(v);
    const x = this._set.has(val);
    this._set.delete(val);
    return x;
  }

  keys(): IterableIterator<K> {
    return map<IV, K>(fromImmutableKey)(this._set.keys());
  }

  values(): IterableIterator<K> {
    return map<IV, K>(fromImmutableKey)(this._set.values());
  }

  entries(): IterableIterator<[K, K]> {
    return map<[IV, IV], [K, K]>(([v1, v2]) => [fromImmutableKey(v1), fromImmutableKey(v2)])(this._set.entries());
  }

  [Symbol.iterator](): IterableIterator<K> {
    return map<IV, K>(fromImmutableKey)(this._set[Symbol.iterator]());
  }

  get size(): number {
    return this._set.size;
  }

  clear(): void {
    return this._set.clear();
  }

  forEach(callbackfn: (value: K, value2: K, set: Set<K>) => void, thisArg?: any): void {
    this._set.forEach((value: IV, value2: IV) => callbackfn(fromImmutableKey(value), fromImmutableKey(value2), this), thisArg);
  }

  get [Symbol.toStringTag](): string {
    return 'ValSet';
  }

  // Non-Standard Properties
  // -----------------------

  remove(v: K) {
    this.delete(v);
    return this;
  }

  empty() {
    this.clear();
    return this;
  }

  static of<K>(data: IV) {
    const x = new ValSet<K>();
    x._set = data.asMutable().delete(SET_TYPE);
    return x;
  }

  get data() {
    const set = this._set.asImmutable();
    this._set = set.asMutable();
    return set.add(SET_TYPE);
  }

  clone() {
    return new ValSet(this);
  }

  equals(b: any) {
    return is(this, b);
  }
}
