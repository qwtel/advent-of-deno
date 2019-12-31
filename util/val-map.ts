// @ts-ignore
import { Map as IMap } from 'immutable';

import { map } from './iter.ts';

import { IV, MAP_TYPE, fromImmutableKey, fromImmutableVal, toImmutableKey, toImmutableVal, is } from './val-funcs.ts';

export class ValMap<K, V> extends Map<K, V> {
  private _map: any;

  constructor(init?: Iterable<[K, V]> | ValMap<K, V>) {
    super();
    this._map = init instanceof ValMap 
      ? init.data.asMutable().delete(MAP_TYPE)
      : IMap(map(([k, v]) => [toImmutableKey(k), toImmutableVal(v)] as [IV, IV])(init || [])).asMutable();
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

  [Symbol.iterator](): IterableIterator<[K, V]> {
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

  // Non-Standard Properties
  // -----------------------

  remove(k: K) {
    this.delete(k);
    return this;
  }
  
  empty() {
    this.clear();
    return this;
  }

  static fromImmutable<K, V>(data: IV) {
    const x = new ValMap<K, V>();
    x._map = data.asMutable().delete(MAP_TYPE);
    return x;
  }

  get data() {
    const map = this._map.asImmutable();
    this._map = map.asMutable();
    return map.set(MAP_TYPE);
  }

  clone(): ValMap<K, V> {
    return new ValMap(this);
  }

  copy(): ValMap<K, V> {
    return new ValMap(this);
  }

  equals(b: any) {
    return is(this, b);
  }
}
