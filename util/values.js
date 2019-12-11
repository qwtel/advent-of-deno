import { Map as IMap, Set as ISet, fromJS } from 'immutable';

import { map, mapKeys } from './lilit.ts';

const toJS = _ => _.toJS();

// TODO: types

export class ValMap {
  constructor(init) {
    this._map = new IMap(mapKeys(fromJS)(init || [])).asMutable();
  }

  get(k) {
    return this._map.get(fromJS(k));
  }

  set(k, v) {
    return this._map.set(fromJS(k), v);
  }

  has(k) {
    return this._map.has(fromJS(k));
  }

  delete(k) {
    return this._map.delete(fromJS(k));
  }

  keys() {
    return map(toJS)(this._map.keys());
  }

  values() {
    return this._map.values();
  }

  entries() {
    return mapKeys(toJS)(this._map.entries());
  }

  [Symbol.iterator]() {
    return mapKeys(toJS)(this._map[Symbol.iterator]());
  }

  get size() {
    return this._map.size;
  }

  clear() {
    return this._map.clear();
  }

  forEach(callbackfn) {
    return this._map.forEach((value, key) => callbackfn(value, toJS(key), this));
  }
}

export class ValSet {
  constructor(init) {
    this._set = new ISet(map(fromJS)(init || [])).asMutable();
  }

  get(v) {
    return this._set.get(fromJS(v));
  }

  add(v) {
    return this._set.add(fromJS(v));
  }

  has(v) {
    return this._set.has(fromJS(v));
  }

  delete(v) {
    return this._set.delete(fromJS(v));
  }

  keys() {
    return map(toJS)(this._set.keys());
  }

  values() {
    return map(toJS)(this._set.values());
  }

  entries() {
    return map(([v1, v2]) => [toJS(v1), toJS(v2)])(this._set.entries());
  }

  [Symbol.iterator]() {
    return map(toJS)(this._set[Symbol.iterator]());
  }

  get size() {
    return this._set.size;
  }

  clear() {
    return this._set.clear();
  }

  forEach(callbackfn) {
    return this._set.forEach((value1, value2) => callbackfn(toJS(value1), toJS(value2), this));
  }
}

// TODO
export class ValArray {}