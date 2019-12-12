import { pipe, map, replaceWhen } from './lilit.ts';

const bindAllFunctions = (ns: Object) => { for (const key in ns) if (typeof ns[key] === 'function') ns[key] = ns[key].bind(ns); }

// IMPORTANT: Patching the global console/Math/JSON object so that methods can be passed to other functions.
bindAllFunctions(console);
bindAllFunctions(Math);
// TODO: others?

export function print(...args: any[]) {
    for (const obj of args) {
        console.dir(obj, { depth: Number.POSITIVE_INFINITY });
    }
}

/**
 * Helper function to read the standard input (or any other stream) 
 * to the end and return as UTF-8 string.
 */
export async function read(file: Deno.File = Deno.stdin): Promise<string> {
    const b = new Deno.Buffer();
    await b.readFrom(file);
    return b.toString();
}

/** 
 * Simple helper to read numeric arguments of the form `<flag> <number>` 
 * from the argument list with fallback values. Mind the empty space between flag and number!
 * E.g. `args(['-w', '-d'], [5, 60])`
 */
export function args(flags: string[], defaults: number[]): IterableIterator<number> {
    return pipe(
        flags,
        map(flag => Deno.args.findIndex((arg: string) => arg === flag)),
        map(i => Deno.args[i + 1]),
        map(Number),
        replaceWhen(Number.isNaN, defaults),
    );
}
