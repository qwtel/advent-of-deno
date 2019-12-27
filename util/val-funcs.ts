// @ts-ignore
import { List as IList, Map as IMap, fromJS as _fromJS, is as _is } from 'immutable';

import { ValMap } from './val-map.ts'
import { ValSet } from './val-set.ts'

import { map, mapValues } from './iter.ts';

export type IV = { toJS: any, asMutable: any, get: any, has: any, delete: any, [Symbol.iterator]: any };

export const MAP_TYPE = '__VAL_MAP__';
export const SET_TYPE = '__VAL_SET__';

export function is(a: any, b: any) {
  return _is(toImmutableVal(a), toImmutableVal(b));
}

export const fromImmutableKey = <K>(v: IV): K => {
  if (v?.has?.(MAP_TYPE)) return ValMap.fromImmutable(v) as unknown as K;
  if (v?.has?.(SET_TYPE)) return ValSet.fromImmutable(v) as unknown as K;
  if ((IList as any).isList(v)) return [...map(fromImmutableKey)(v)] as unknown as K;
  if ((IMap as any).isMap(v)) return Object.fromEntries(mapValues(fromImmutableKey)(v));
  return (v?.toJS?.() ?? v) as K;
}

export const toImmutableKey = <K>(v: K): IV => {
  if (v instanceof ValMap) return v.data;
  if (v instanceof ValSet) return v.data;
  if (v instanceof Array) return IList(v.map(toImmutableKey));
  if (v instanceof Object && v.constructor === Object) return IMap(mapValues(toImmutableKey)(Object.entries(v)));
  return _fromJS(v);
}

// Same as `fromImmutableKey`, but will leave unknown types untouched.
export const fromImmutableVal = <K>(v: IV): K => {
  if (v?.has?.(MAP_TYPE)) return ValMap.fromImmutable(v) as unknown as K;
  if (v?.has?.(SET_TYPE)) return ValSet.fromImmutable(v) as unknown as K;
  if ((IList as any).isList(v)) return [...map(fromImmutableVal)(v)] as unknown as K;
  if ((IMap as any).isMap(v)) return Object.fromEntries(mapValues(fromImmutableVal)(v));
  return v as unknown as K;
}

// Same as `toImmutableKey`, but will leave unknown types untouched.
export const toImmutableVal = <K>(v: K): IV => {
  if (v instanceof ValMap) return v.data;
  if (v instanceof ValSet) return v.data;
  if (v instanceof Array) return IList(v.map(toImmutableVal));
  if (v instanceof Object && v.constructor === Object) return IMap(mapValues(toImmutableVal)(Object.entries(v)));
  return v as unknown as IV;
}
