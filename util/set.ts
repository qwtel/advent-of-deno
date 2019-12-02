import { concat, filter } from './lilit.ts';

export function union(...as: Iterable<{}>[]): Set<{}> {
    return new Set(concat(...as));
}

export function subtract(as: Iterable<{}>, ...bss: Iterable<{}>[]): Set<{}> {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => !B.has(a)))(as));
}

export function intersect(as: Iterable<{}>, ...bss: Iterable<{}>[]): Set<{}> {
    const Bs = bss.map(bs => bs instanceof Set ? bs : new Set(bs));
    return new Set(filter(a => Bs.every(B => B.has(a)))(as));
}