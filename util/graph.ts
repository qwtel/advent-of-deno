import { pipe, map, min, filter, pairwise, flatten, toArray } from "./lilit.ts";
import { findAndRemove } from "./other.ts";
import { ValMap } from "./values.ts";

type Graph = {
  edges: Array<[string, string]>;
  vertices: Set<string>;
  dirs: Map<string, string[]>;
  deps: Map<string, string[]>;
  weights: ValMap<[string, string], number>;
}

export function makeGraph(data: [string, string, number?][], { sorted = false }: { sorted?: boolean } = {}): Graph {
  const edges = pipe(data, map(([a, b]) => [a, b] as [string, string]), toArray());
  const vertices = new Set([...pipe(edges, flatten<string>())]);
    
  const dirs = new Map<string, string[]>();
  const deps = new Map<string, string[]>();
  const weights = new ValMap<[string, string], number>();

  for (const [a, b, w] of data) {
    dirs.set(a, [...dirs.get(a) || [], b]);
    deps.set(b, [...deps.get(b) || [], a]);
    weights.set([a, b], w ?? 1);
  }

  if (sorted) {
    for (const k of dirs.keys()) dirs.get(k).sort();
    for (const k of deps.keys()) deps.get(k).sort();
  }

  return { edges, vertices, dirs, deps, weights };
}

export const incoming = ({ deps }: Graph, v: string) => deps.get(v) || [];
export const outgoing = ({ dirs }: Graph, v: string) => dirs.get(v) || [];
export const neighbors = (g: Graph, v: string) => [...incoming(g, v), ...outgoing(g, v)];
export const weight = (g: Graph, e: [string, string]) => g.weights.get(e);

// Walks the graph in bfs-like fashion, but will revisit nodes if they are encountered again.
// Will not terminate for cyclic graphs!
export function* walk(g: Graph, start: string) {
  const q = [start];
  for (const v of q) {
    yield v;
    q.push(...outgoing(g, v));
  }
}

const unwind = (prev: Map<string, string>, target: string) => {
  const path: string[] = [];
  let u = target;
  while (u) {
    path.unshift(u);
    u = prev.get(u);
  }
  return [...pipe(path, pairwise())];
}

export function bfs(g: Graph, source: string, target: string) {
  const q = [source];
  const prev = new Map<string, string>([[source, null]]);

  outer: while (q.length) {
    const curr = q.pop();
    for (const n of neighbors(g, curr)) {
      if (n === target) {
        prev.set(n, curr);
        break outer;
      } else if (!prev.has(n)) { 
        prev.set(n, curr);
        q.push(n); 
      }
    }
  }

  // TODO: Not found?

  return unwind(prev, target);
}

export function dijkstra(g: Graph, source: string, target: string) {
  const { vertices } = g;

  const q = [];
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();

  for (const v of vertices) {
    dist.set(v, Number.POSITIVE_INFINITY);
    prev.set(v, undefined);
    q.push(v);
  }
  dist.set(source, 0);

  while (q.length) {
    // slooooooooooooooooooooow
    const shortest = pipe(q, map(_ => dist.get(_)), min());
    const u = findAndRemove(q, v => dist.get(v) === shortest);

    if (u === target) break;

    for (const v of pipe(neighbors(g, u), filter(v => q.includes(v)))) {
      const alt = dist.get(u) + g.weights.get([u, v]);
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }

  return unwind(prev, target);
}