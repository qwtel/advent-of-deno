import { pipe, map, replaceWhen } from './lilit.ts';

/**
 * Helper function to read the standard input (or any other stream) 
 * to the end and return as UTF-8 string.
 */
export async function read(file: Deno.File): Promise<string> {
    const b = new Deno.Buffer();
    await b.readFrom(file);
    return b.toString();
}

/** 
 * Simple helper to read numeric arguments of the form `<flag> <number>` 
 * from the argument list with fallback values. Mind the empty space between flag and number!
 * E.g. `args(['-w', '-d'], [5, 60])`
 */
export function args(flags: string[], defaults: number[]): Iterable<number> {
    return pipe(
        flags,
        map(flag => Deno.args.findIndex((arg: string) => arg === flag)),
        map(i => Deno.args[i + 1]),
        map(Number),
        replaceWhen(Number.isNaN, defaults),
    );
}

// Patch the global console object so that methods can be passed to other functions
for (const key in console) if (typeof console[key] === 'function') console[key] = console[key].bind(console);