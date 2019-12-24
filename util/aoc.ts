import { pipe, map, replaceWhen } from './lilit.ts';
import { bindAll } from './other.ts';

// IMPORTANT: Patching the global console/Math/JSON object so that methods can be passed to other functions.
bindAll(console);
bindAll(Math);
// TODO: others?

export function print(...args: any[]) {
    for (const obj of args) {
        console.dir(obj, { depth: Number.POSITIVE_INFINITY });
    }
}

globalThis.print = print;

/**
 * Helper function to read the standard input (or any other stream) 
 * to the end and return as UTF-8 string.
 */
export async function read(file: Deno.File = Deno.stdin): Promise<string> {
    const b = new Deno.Buffer();
    await b.readFrom(file);
    return b.toString();
}

export async function locateInputFile(url: string) {
    const match = new URL(url).pathname.match(/([^/]+)$/);
    const fName = match?.[1].split('.')[0];
    return fName && await Deno.open(`./input/${fName}`);
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
