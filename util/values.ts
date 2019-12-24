// Drop-in replacements for JS `Map` and `Set` types that operate with values instead of object identities.
// In other words, it allows things like `map.set([0, 0], 'X'); map.get([0, 0]); // => 'X'`.
//
// Internally it uses ImmutableJS to for value comparisons, but doesn't expose ImmutableJS types.
// Instead it converts to and from ImmutableJS as values go in and out.
// This also means that its performance *is not* comparable to using ImmutableJS proper,
// or similar functionality in the Clojure/Script standard library.
// For tuples and small object keys the conversion overhead won't matter much , but beware passing large objects or arrays.
//
// This module would be rendered obsolete it if the "Record & Tuple" proposal was to be accepted by TC39:
// https://github.com/tc39/proposal-record-tuple

export { is } from './val-funcs.ts';
export { ValSet } from './val-set.ts';
export { ValMap } from './val-map.ts';