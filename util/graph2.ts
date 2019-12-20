import { pipe, map, min, filter, pairwise, flatten, toArray, sum, flatMap, product2, concat2, toSet } from "./lilit.ts";
import { findAndRemove } from "./other.ts";
import { ValMap, ValSet } from "./values.ts";
// import { PriorityQueue } from "./priority-queue.ts";

export type Edge = [string, string];
export type WeightedEdge = [string, string, number];
export type GraphData = {
  vertices: Set<string>;
  dirs: Map<string, Set<string>>;
  deps: Map<string, Set<string>>;
  weights: ValMap<Edge, number>;
}

export class Graph implements GraphData {
  vertices: Set<string>;
  dirs: Map<string, Set<string>>;
  deps: Map<string, Set<string>>;
  weights: ValMap<[string, string], number>;

  constructor(data: [string, string, number?][]) {
    const edges = pipe(data, map(([a, b]) => [a, b] as [string, string]), toArray());
    this.vertices = new Set([...pipe(edges, flatten<string>())]);
      
    this.dirs = new Map(pipe(this.vertices, map(v => [v, new Set()] as [string, Set<string>])));
    this.deps = new Map(pipe(this.vertices, map(v => [v, new Set()] as [string, Set<string>])));
    this.weights = new ValMap();
    for (const [a, b, w] of data) {
      this.dirs.set(a, this.dirs.get(a).add(b));
      this.deps.set(b, this.deps.get(b).add(a));
      this.weights.set([a, b], w ?? 1);
    }
  }

  get edges(): ValSet<Edge> {
    return pipe(
      this.dirs,
      flatMap(([a, bs]) => pipe(bs, map(b => [a, b] as Edge))),
      _ => new ValSet(_),
    );
  }

  get weightedEdges(): ValSet<WeightedEdge> { 
    return pipe(
      this.dirs,
      flatMap(([a, bs]) => pipe(bs, map(b => [a, b, this.weight([a, b])] as WeightedEdge))),
      _ => new ValSet(_),
    );
  }

  incoming(v: string) { return this.deps.get(v).values(); }
  outgoing(v: string) { return this.dirs.get(v).values(); }
  neighbors(v: string) { return concat2(this.incoming(v), this.outgoing(v)); }

  weight(e: Edge) { return this.weights.get(e); }
  totalWeight () { return pipe(this.weights.values(), sum()); }

  incomingEdges(v: string) { return pipe(this.incoming(v), map(u => [u, v, this.weight([u, v])] as WeightedEdge)); }
  outgoingEdges(v: string) { return pipe(this.outgoing(v), map(u => [v, u, this.weight([v, u])] as WeightedEdge)); }


  // SEARCH
  // ------

  // Walks the graph in bfs-like fashion, but will revisit nodes if they are encountered again.
  // Will not terminate for cyclic graphs!
  *walk(start: string) {
    const q = [start];
    for (const v of q) {
      yield v;
      q.push(...this.outgoing(v));
    }
  }
  
  bfs(source: string, target: string) {
    const q = [source];
    const prev = new Map<string, string>([[source, null]]);

    for (const curr of q) {
      for (const n of this.outgoing(curr)) {
        if (n === target) {
          prev.set(n, curr);
          return unwind(prev, target);
        } else if (!prev.has(n)) { 
          prev.set(n, curr);
          q.push(n); 
        }
      }
    }

    // TODO: Not found?

  }


  dijkstra(source: string, target: string) {
    const q = [];
    const dist = new Map<string, number>();
    const prev = new Map<string, string>();

    for (const v of this.vertices) {
      dist.set(v, Number.POSITIVE_INFINITY);
      prev.set(v, undefined);
      q.push(v);
    }
    dist.set(source, 0);

    while (q.length) {
      // slooooooooooooooooooooow
      const shortest = pipe(q, map(_ => dist.get(_)), min());
      const u = findAndRemove(q, v => dist.get(v) === shortest);

      if (u === target) return unwind(prev, target);

      for (const v of pipe(this.outgoing(u), filter(v => q.includes(v)))) {
        const alt = dist.get(u) + this.weight([u, v]);
        if (alt < dist.get(v)) {
          dist.set(v, alt);
          prev.set(v, u);
        }
      }
    }

    // TODO: not found?
  }

  // dijkstra2(source: string, target: string) {
  //   const dist = new Map([[source, 0]]);
  //   const prev = new Map<string, string>();
  //   const q = new PriorityQueue([], ([a], [b]) => b - a)

  //   for (const v of this.vertices) {
  //     if (v !== source) dist.set(v, Number.POSITIVE_INFINITY)
  //     prev.set(v, undefined)
  //     q.push([dist.get(v), v])
  //   }

  //   for (const u of q) {
  //     for (const v of pipe(this.outgoing(u), filter(v => q.includes(v)))) {
  //   }
  // }
  // 1  function Dijkstra(Graph, source):
  // 2      dist[source] ← 0                           // Initialization
  // 3
  // 4      create vertex priority queue Q
  // 5
  // 6      for each vertex v in Graph:           
  // 7          if v ≠ source
  // 8              dist[v] ← INFINITY                 // Unknown distance from source to v
  // 9          prev[v] ← UNDEFINED                    // Predecessor of v
  // 10
  // 11         Q.add_with_priority(v, dist[v])
  // 12
  // 13
  // 14     while Q is not empty:                      // The main loop
  // 15         u ← Q.extract_min()                    // Remove and return best vertex
  // 16         for each neighbor v of u:              // only v that are still in Q
  // 17             alt ← dist[u] + length(u, v) 
  // 18             if alt < dist[v]
  // 19                 dist[v] ← alt
  // 20                 prev[v] ← u
  // 21                 Q.decrease_priority(v, alt)
  // 22
  // 23     return dist, prev


  // MUTATION
  // --------

  addEdge(e: WeightedEdge) {
    const [a, b, w] = e;
    this.vertices.add(a).add(b);
    this.dirs.set(a, (this.dirs.get(a) || new Set()).add(b));
    this.deps.set(b, (this.deps.get(b) || new Set()).add(a));
    this.weights.set([a, b], w ?? 1);
    return this;
  }

  addEdges(...es: WeightedEdge[]) {
    for (const e of es) this.addEdge(e);
    return this;
  }

  deleteEdge([a, b]: Edge) {
    this.dirs.get(a).delete(b);
    this.deps.get(b).delete(a);
    return this.weights.delete([a, b])
  }

  deleteVertex(v: string) {
    for (const [a, b] of this.incomingEdges(v)) this.deleteEdge([a, b]);
    for (const [a, b] of this.outgoingEdges(v)) this.deleteEdge([a, b]);
    return this.vertices.delete(v);
  }

  deleteVertexWithCompaction(v: string) {
    const toAdd = pipe(
      product2(this.incomingEdges(v), this.outgoingEdges(v)),
      map(([[a, , w1], [, b, w2]]) => [a, b, w1 + w2] as WeightedEdge),
      filter(([a, b]) => a !== b),
      toArray(),
    );
    this.deleteVertex(v);
    this.addEdges(...toAdd);
  }
}

function unwind(prev: Map<string, string>, target: string) {
  const path: string[] = [];
  let u = target;
  while (u) {
    path.unshift(u);
    u = prev.get(u);
  }
  return [...pipe(path, pairwise())];
}
