#!/usr/bin/env -S deno --importmap=../import_map.json

import { Map as IMap, Set as ISet, fromJS as _fromJS } from 'immutable';

import { map, mapKeys } from './lilit.ts';

// TODO: types
type IV = { toJS: any };

const toJS = <K>(_: IV) => (_ && _.toJS ? _.toJS() : _) as K;
const fromJS = <K>(_: K): IV => _fromJS(_);

export class ValMap<K, V> implements Map<K, V> {
  private _map: any;

  constructor(init?: Iterable<[K, V]>) {
    this._map = IMap(mapKeys<K, IV, V>(fromJS)(init || [])).asMutable();
  }

  get(k: K) {
    return this._map.get(fromJS(k));
  }

  set(k: K, v: V) {
    this._map.set(fromJS(k), v);
    return this;
  }

  has(k: K) {
    return this._map.has(fromJS(k));
  }

  delete(k: K) {
    const keyVal = fromJS(k);
    const x = this._map.has(keyVal);
    this._map.delete(keyVal);
    return x;
  }

  keys() {
    return map<IV, K>(toJS)(this._map.keys());
  }

  values() {
    return this._map.values();
  }

  entries() {
    return mapKeys<IV, K, V>(toJS)(this._map.entries());
  }

  [Symbol.iterator]() {
    return mapKeys<IV, K, V>(toJS)(this._map[Symbol.iterator]());
  }

  get size() {
    return this._map.size;
  }

  clear() {
    return this._map.clear();
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this._map.forEach((value: V, key: IV) => callbackfn(value, toJS(key), this), thisArg);
  }

  get [Symbol.toStringTag](): string {
    return 'ValMap';
  }
}

export class ValSet<V> implements Set<V> {
  private _set: any;

  constructor(init?: Iterable<V>) {
    this._set = ISet(map<V, IV>(fromJS)(init || [])).asMutable();
  }

  add(v: V) {
    this._set.add(fromJS(v));
    return this;
  }

  has(v: V) {
    return this._set.has(fromJS(v));
  }

  delete(v: V) {
    const val = fromJS(v);
    const x = this._set.has(val);
    this._set.delete(val);
    return x;
  }

  keys() {
    return map<IV, V>(toJS)(this._set.keys());
  }

  values() {
    return map<IV, V>(toJS)(this._set.values());
  }

  entries() {
    return map<[IV, IV], [V, V]>(([v1, v2]) => [toJS(v1), toJS(v2)])(this._set.entries());
  }

  [Symbol.iterator]() {
    return map<IV, V>(toJS)(this._set[Symbol.iterator]());
  }

  get size() {
    return this._set.size;
  }

  clear() {
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