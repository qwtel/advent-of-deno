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

import { Map as IMap, Set as ISet, List as IList, fromJS as _fromJS } from 'immutable';

import { map } from './lilit.ts';

type IV = { toJS: any, asMutable: any, get: any, has: any, delete: any, isList: any, [Symbol.iterator]: any };

const MAP_TYPE = '__VAL_MAP__';
const SET_TYPE = '__VAL_SET__';

const BARE = Symbol('bare');

const fromImmutableKey = <K>(v: IV): K => {
  if (v?.isList?.()) return [...map(fromImmutableKey)(v)] as unknown as K;
  if (v?.has?.(MAP_TYPE)) return ValMap.of(v) as unknown as K;
  if (v?.has?.(SET_TYPE)) return ValSet.of(v) as unknown as K;
  // TODO: Plain Object / Record
  return (v?.toJS?.() ?? v) as K;
}

const toImmutableKey = <K>(v: K): IV => {
  if (v instanceof Array) return IList(v.map(toImmutableKey));
  if (v instanceof ValMap) return v.data;
  if (v instanceof ValSet) return v.data;
  // TODO: Plain Object / Record
  return _fromJS(v);
}

// As as `fromImmutableKey`, but will leave unknown types untouched.
const fromImmutableVal = <K>(v: IV): K => {
  if (v?.isList?.()) return [...map(fromImmutableKey)(v)] as unknown as K;
  if (v?.has?.(MAP_TYPE)) return ValMap.of(v) as unknown as K;
  if (v?.has?.(SET_TYPE)) return ValSet.of(v) as unknown as K;
  // TODO: Plain Object / Record
  return v as unknown as K;
}

// As as `toImmutableKey`, but will leave unknown types untouched.
const toImmutableVal = <K>(v: K) => {
  if (v instanceof Array) return IList(v.map(toImmutableKey));
  if (v instanceof ValMap) return v.data;
  if (v instanceof ValSet) return v.data;
  // TODO: Plain Object / Record
  return v;
}

export class ValMap<K, V> extends Map<K, V> {
  private _map: any;

  constructor(init?: Iterable<[K, V]>) {
    super();
    if (init as unknown === BARE) return;
    else if (init instanceof ValMap) this._map = init.data.asMutable().delete(MAP_TYPE);
    else this._map = IMap(map(([k, v]) => [toImmutableKey(k), toImmutableVal(v)])(init || [])).asMutable();
  }

  get(k: K): V {
    return fromImmutableVal(this._map.get(toImmutableKey(k)));
  }

  set(k: K, v: V) {
    this._map.set(toImmutableKey(k), toImmutableVal(v));
    return this;
  }

  has(k: K): boolean {
    return this._map.has(toImmutableKey(k));
  }

  delete(k: K): boolean {
    const keyVal = toImmutableKey(k);
    const x = this._map.has(keyVal);
    this._map.delete(keyVal);
    return x;
  }

  keys(): IterableIterator<K> {
    return map<IV, K>(fromImmutableKey)(this._map.keys());
  }

  values(): IterableIterator<V> {
    return map<IV, V>(fromImmutableVal)(this._map.values());
  }

  entries(): IterableIterator<[K, V]> {
    return map<[IV, IV], [K, V]>(([k, v]) => [fromImmutableKey(k), fromImmutableVal(v)])(this._map.entries());
  }

  [Symbol.iterator]() {
    return map<[IV, IV], [K, V]>(([k, v]) => [fromImmutableKey(k), fromImmutableVal(v)])(this._map[Symbol.iterator]());
  }

  get size(): number {
    return this._map.size;
  }

  clear(): void {
    return this._map.clear();
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach((value: IV, key: IV) => callbackfn(fromImmutableVal(value), fromImmutableKey(key), this), thisArg);
  }

  get [Symbol.toStringTag](): string {
    return 'ValMap';
  }

  // Non-Standard Methods
  // --------------------

  remove(k: K) {
    this.delete(k);
    return this;
  }

  static of<K, V>(data: IV) {
    const x = new ValMap<K, V>(BARE as any)
    x._map = data.asMutable().delete(MAP_TYPE);
    return x;
  }

  get data() {
    const map = this._map.asImmutable();
    this._map = map.asMutable();
    return map.set(MAP_TYPE);
  }

  clone() {
    return new ValMap(this);
  }
}

export class ValSet<K> extends Set<K> {
  private _set: any;

  constructor(init?: Iterable<K>) {
    super();
    if (init as unknown === BARE) return;
    else if (init instanceof ValSet) this._set = init.data.asMutable().delete(SET_TYPE);
    else this._set = ISet(map<K, IV>(toImmutableKey)(init || [])).asMutable();
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

  [Symbol.iterator]() {
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

  // Non-Standard Methods
  // --------------------

  remove(v: K) {
    this.delete(v);
    return this;
  }

  static of<K>(data: IV) {
    const x = new ValSet<K>(BARE as any);
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
}
