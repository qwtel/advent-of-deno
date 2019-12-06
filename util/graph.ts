import { pipe, map, min, filter, pairwise, flatten, unique } from "./lilit.ts";
import { findAndRemove } from "./other.ts";

type Graph = {
  edges: [string, string][];
  vertices: string[];
  dirs: Map<string, string[]>;
  deps: Map<string, string[]>;
}

export function makeGraph(edges: [string, string][], { sorted = false }: { sorted?: boolean } = {}) {
  const vertices = [...pipe(edges, flatten(), unique())];
    
  const dirs = new Map();
  const deps = new Map();
  for (const [a, b] of edges) {
    dirs.set(a, [...dirs.get(a) || [], b]);
    deps.set(b, [...deps.get(b) || [], a]);
  }

  if (sorted) {
    for (const k of dirs.keys()) dirs.get(k).sort();
    for (const k of deps.keys()) deps.get(k).sort();
  }

  return { edges, vertices, dirs, deps };
}

const neighbors = ({ deps, dirs, }: Graph, v: string) => [...deps.get(v) || [], ...dirs.get(v) || []];

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

  let curr: string;
  while (curr = q.pop()) {
    for (const n of neighbors(g, curr)) {
      if (n === target) {
        prev.set(n, curr);
        break;
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
    const shortest = pipe(q, map(v => dist.get(v)), min());
    const u = findAndRemove(q, v => dist.get(v) === shortest);

    if (u === target) break;

    for (const v of pipe(neighbors(g, u), filter(v => q.includes(v)))) {
      const alt = dist.get(u) + 1; // length is always 1
      if (alt < dist.get(v)) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }

  return unwind(prev, target);
}