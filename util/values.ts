// Drop-in replacements for JS `Map` and `Set` types that operate with values instead of object identities.
// In other words, it allows things like `map.set([0, 0], 'X'); map.get([0, 0]); // => 'X'`.
// It's not limited to tuples, setting whole objects works too, e.g. `set.add({ a: 0, b: 1 }); set.has({ b: 1, a: 0 }); // => true`.
//
// Internally it uses ImmutableJS to for value comparisons, but doesn't expose ImmutableJS types.
// Instead it converts to and from ImmutableJS as values go in and out.
// This also means that its performance *is not* comparable to using ImmutableJS proper,
// or similar functionality in the Clojure/Script standard library.
// For tuples and small object keys the conversion overhead won't matter much , but beware passing large objects or arrays.
//
// This module would be rendered obsolete it if the "Record & Tuple" proposal was to be accepted by TC39:
// https://github.com/tc39/proposal-record-tuple

import { Map as IMap, Set as ISet, fromJS as _fromJS } from 'immutable';

import { map, mapKeys } from './lilit.ts';

// TODO: types
type IV = { toJS: any };

const toJS = <K>(_: IV) => (_ && _.toJS ? _.toJS() : _) as K;
const fromJS = <K>(_: K): IV => _fromJS(_);

export class ValMap<K, V> extends Map<K, V> {
  private _map: any;

  constructor(init?: Iterable<[K, V]>) {
    super();
    this._map = IMap(mapKeys<K, IV, V>(fromJS)(init || [])).asMutable();
  }

  get(k: K): V {
    return this._map.get(fromJS(k));
  }

  set(k: K, v: V) {
    this._map.set(fromJS(k), v);
    return this;
  }

  has(k: K): boolean {
    return this._map.has(fromJS(k));
  }

  delete(k: K): boolean {
    const keyVal = fromJS(k);
    const x = this._map.has(keyVal);
    this._map.delete(keyVal);
    return x;
  }

  keys(): IterableIterator<K> {
    return map<IV, K>(toJS)(this._map.keys());
  }

  values(): IterableIterator<V> {
    return this._map.values();
  }

  entries(): IterableIterator<[K, V]> {
    return mapKeys<IV, K, V>(toJS)(this._map.entries());
  }

  [Symbol.iterator]() {
    return mapKeys<IV, K, V>(toJS)(this._map[Symbol.iterator]());
  }

  get size(): number {
    return this._map.size;
  }

  clear(): void {
    return this._map.clear();
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach((value: V, key: IV) => callbackfn(value, toJS(key), this), thisArg);
  }

  get [Symbol.toStringTag](): string {
    return 'ValMap';
  }
}

export class ValSet<V> extends Set<V> {
  private _set: any;

  constructor(init?: Iterable<V>) {
    super();
    this._set = ISet(map<V, IV>(fromJS)(init || [])).asMutable();
  }

  add(v: V) {
    this._set.add(fromJS(v));
    return this;
  }

  has(v: V): boolean {
    return this._set.has(fromJS(v));
  }

  delete(v: V): boolean {
    const val = fromJS(v);
    const x = this._set.has(val);
    this._set.delete(val);
    return x;
  }

  keys(): IterableIterator<V> {
    return map<IV, V>(toJS)(this._set.keys());
  }

  values(): IterableIterator<V> {
    return map<IV, V>(toJS)(this._set.values());
  }

  entries(): IterableIterator<[V, V]> {
    return map<[IV, IV], [V, V]>(([v1, v2]) => [toJS(v1), toJS(v2)])(this._set.entries());
  }

  [Symbol.iterator]() {
    return map<IV, V>(toJS)(this._set[Symbol.iterator]());
  }

  get size(): number {
    return this._set.size;
  }

  clear(): void {
    return this._set.clear();
  }

  forEach(callbackfn: (value: V, value2: V, set: Set<V>) => void, thisArg?: any): void {
    this._set.forEach((value1: IV, value2: IV) => callbackfn(toJS(value1), toJS(value2), this), thisArg);
  }

  get [Symbol.toStringTag](): string {
    return 'ValSet';
  }
}

// TODO
// export class ValArray {}